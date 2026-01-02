import type { Player, GameState } from './types';
import { LOCATIONS, POLICIES, ROLES } from './data';

export class GameEngine {
  players: Player[] = [];
  currentPlayerIndex = 0;
  mayorIndex = 0;
  currentRound = 1;
  maxRounds = 12;
  gameState: GameState = 'setup';
  gameLog: string[] = [];
  currentPolicy: string | null = null;
  selectedPolicy: string | null = null;
  actionSlots: Record<string, (number | null)[]> = {};
  roleSelectionOrder: number[] = [];
  currentRoleSelector = 0;
  selectedRoles: Record<number, string> = {};
  votingResults: Record<number, { votes: number; voters: string[] }> = {};
  currentVoter = 0;
  playerStartingChoices: Record<number, number> = {};
  currentStartingPlayer = 0;

  initializeActionSlots(playerCount: number) {
    const slotsPerLocation = playerCount === 3 ? 2 : 3;

    Object.keys(LOCATIONS).forEach((locationId) => {
      this.actionSlots[locationId] = Array(slotsPerLocation).fill(null);
    });
  }

  createPlayers(playerCount: number) {
    this.players = [];
    for (let i = 1; i <= playerCount; i++) {
      this.players.push({
        id: i,
        name: `Player ${i}`,
        gold: 5,
        goods: {},
        political_influence: 1,
        servants_available: 2,
        servants_total: 2,
        victory_points: 0,
        role: null,
        buildings: [],
        henchman_cards: [],
        news_cards: [],
        extra_servants: 0,
      });
    }
  }

  startNewGame(playerCount: number) {
    this.createPlayers(playerCount);
    this.currentRound = 1;
    this.mayorIndex = 0;
    this.gameState = 'starting_choices';
    this.currentStartingPlayer = 0;
    this.initializeActionSlots(playerCount);
    this.log(`Game started with ${playerCount} players!`);
  }

  applyStartingChoice(
    playerIndex: number,
    _choiceIndex: number,
    choice: {
      name: string;
      rewards: {
        gold: number;
        political_influence: number;
        buildings?: string[];
        henchman_cards?: number;
      };
    }
  ) {
    const player = this.players[playerIndex];
    if (!player) return;

    player.gold += choice.rewards.gold;
    player.political_influence += choice.rewards.political_influence;

    if (choice.rewards.buildings) {
      player.buildings.push(...choice.rewards.buildings);
    }

    if (choice.rewards.henchman_cards) {
      for (let i = 0; i < choice.rewards.henchman_cards; i++) {
        player.henchman_cards.push(`Henchman Card ${i + 1}`);
      }
    }

    this.log(`${player.name} chose ${choice.name} background`);
  }

  startMayorElection() {
    this.log(`Starting Mayor Election for Round ${this.currentRound}`);
    this.currentVoter = 0;
    this.votingResults = {};

    this.players.forEach((player) => {
      this.votingResults[player.id] = { votes: 0, voters: [] };
    });
  }

  castVote(candidateId: number) {
    const voter = this.players[this.currentVoter];
    if (!voter) return;

    const candidate = this.players.find((p) => p.id === candidateId);
    if (!candidate) return;

    if (this.votingResults[candidateId]) {
      this.votingResults[candidateId]!.votes += voter.political_influence;
      this.votingResults[candidateId]!.voters.push(voter.name);
    }

    this.log(
      `${voter.name} voted for ${candidate.name} (${voter.political_influence} influence)`
    );

    this.currentVoter++;
  }

  tallyVotes(): number {
    let maxVotes = 0;
    let winners: number[] = [];

    Object.keys(this.votingResults).forEach((playerId) => {
      const votes = this.votingResults[parseInt(playerId)]?.votes || 0;
      if (votes > maxVotes) {
        maxVotes = votes;
        winners = [parseInt(playerId)];
      } else if (votes === maxVotes && votes > 0) {
        winners.push(parseInt(playerId));
      }
    });

    if (winners.length > 1) {
      const currentMayorInWinners = winners.includes(
        this.players[this.mayorIndex]?.id || 0
      );
      if (currentMayorInWinners) {
        return this.mayorIndex;
      } else {
        let closestDistance = this.players.length;
        let newMayorId = winners[0] || 0;

        winners.forEach((winnerId) => {
          const winnerIndex = this.players.findIndex((p) => p.id === winnerId);
          let distance =
            (winnerIndex - this.mayorIndex + this.players.length) %
            this.players.length;
          if (distance === 0) distance = this.players.length;

          if (distance < closestDistance) {
            closestDistance = distance;
            newMayorId = winnerId;
          }
        });

        return this.players.findIndex((p) => p.id === newMayorId);
      }
    } else if (winners.length === 1) {
      return this.players.findIndex((p) => p.id === winners[0]);
    }

    return this.mayorIndex;
  }

  startRoleSelection() {
    this.roleSelectionOrder = [];
    for (let i = 1; i < this.players.length; i++) {
      const index =
        (this.mayorIndex - i + this.players.length) % this.players.length;
      this.roleSelectionOrder.push(index);
    }

    this.selectedRoles = { [this.mayorIndex]: 'mayor' };
    if (this.players[this.mayorIndex]) {
      this.players[this.mayorIndex]!.role = 'mayor';
    }

    this.currentRoleSelector = 0;
    this.log('Role selection begins...');
  }

  selectRole(playerIndex: number, roleId: string) {
    this.selectedRoles[playerIndex] = roleId;
    const player = this.players[playerIndex];
    if (player) {
      player.role = roleId;
      this.applyRoleEffects(player, roleId);
      this.log(`${player.name} selected ${ROLES[roleId]?.name || roleId}`);
    }
  }

  applyRoleEffects(player: Player, roleId: string) {
    switch (roleId) {
      case 'recruiter':
        player.extra_servants = 1;
        this.log(`${player.name} gains an extra servant this round`);
        break;
      case 'thieves_guildmaster':
        this.log(`${player.name} can block one action space`);
        break;
    }
  }

  applyPolicy(policyId: string) {
    const policy = POLICIES[policyId];
    if (!policy) return;

    switch (policyId) {
      case 'martial_law':
        this.players.forEach((player) => {
          player.political_influence = Math.max(
            0,
            player.political_influence - 1
          );
        });
        if (LOCATIONS.thieves_guild) {
          LOCATIONS.thieves_guild.closed = true;
        }
        this.log('All players lose 1 political influence. Thieves Guild closed.');
        break;
      case 'censorship':
        if (LOCATIONS.printing_press) {
          LOCATIONS.printing_press.closed = true;
        }
        this.log('Printing Press closed this round.');
        break;
      case 'embargo':
        if (LOCATIONS.marketplace) {
          LOCATIONS.marketplace.closed = true;
        }
        this.log('Marketplace closed this round.');
        break;
    }
  }

  placeServant(locationId: string, slotIndex: number, playerId: number) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return false;

    if (player.servants_available <= 0) {
      this.log(`${player.name} has no servants available!`);
      return false;
    }

    if (this.actionSlots[locationId]?.[slotIndex] !== null) {
      this.log('That slot is already occupied!');
      return false;
    }

    if (this.actionSlots[locationId]) {
      this.actionSlots[locationId][slotIndex] = playerId;
    }
    player.servants_available--;

    this.log(
      `${player.name} placed a servant at ${LOCATIONS[locationId]?.name || locationId}`
    );
    return true;
  }

  endRound() {
    this.log(`Round ${this.currentRound} completed!`);

    this.players.forEach((player) => {
      player.servants_available = player.servants_total + player.extra_servants;
      player.extra_servants = 0;
      player.role = null;
    });

    Object.keys(this.actionSlots).forEach((locationId) => {
      const slots = this.actionSlots[locationId];
      if (slots) {
        this.actionSlots[locationId] = slots.map(() => null);
      }
      const location = LOCATIONS[locationId as keyof typeof LOCATIONS];
      if (location) {
        location.closed = false;
      }
    });

    this.currentPolicy = null;
    this.selectedPolicy = null;

    this.currentRound++;

    if (this.currentRound > this.maxRounds) {
      this.endGame();
    }
  }

  endGame() {
    this.gameState = 'finished';

    const sortedPlayers = [...this.players].sort(
      (a, b) => b.victory_points - a.victory_points
    );

    this.log('Game finished!');
    this.log(
      `Winner: ${sortedPlayers[0]?.name || 'Unknown'} with ${sortedPlayers[0]?.victory_points || 0} victory points!`
    );
  }

  getCurrentPlayer(): Player | undefined {
    return this.players[this.currentPlayerIndex];
  }

  getMayor(): Player | undefined {
    return this.players[this.mayorIndex];
  }

  log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.gameLog.push(`[${timestamp}] ${message}`);
  }

  getState() {
    return {
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      mayorIndex: this.mayorIndex,
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      gameState: this.gameState,
      gameLog: this.gameLog.slice(-10),
      currentPolicy: this.currentPolicy,
      selectedPolicy: this.selectedPolicy,
      actionSlots: this.actionSlots,
      roleSelectionOrder: this.roleSelectionOrder,
      currentRoleSelector: this.currentRoleSelector,
      selectedRoles: this.selectedRoles,
      votingResults: this.votingResults,
      currentVoter: this.currentVoter,
      currentStartingPlayer: this.currentStartingPlayer,
    };
  }
}
