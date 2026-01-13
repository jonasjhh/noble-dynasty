import { useState, useEffect } from 'react';
import { LobbyPanel } from './components/LobbyPanel';
import { GameLobby } from './components/GameLobby';
import { StartingChoicesModal } from './components/StartingChoicesModal';
import { MayorElectionModal } from './components/MayorElectionModal';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { PolicySelectionModal } from './components/PolicySelectionModal';
import { PlayerInfo } from './components/PlayerInfo';
import { GameBoard } from './components/GameBoard';
import { STARTING_CHOICES, ROLES } from './data';
import {
  createGame,
  joinGame,
  startGame,
  getGame,
  updateGame,
  updatePlayer,
  addGameLog,
  subscribeToGame,
  dbPlayerToLocal,
  type GameWithPlayers,
} from './services/gameService';

type AppState = 'menu' | 'lobby' | 'in_game';

function App() {
  const [appState, setAppState] = useState<AppState>('menu');
  const [game, setGame] = useState<GameWithPlayers | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to game updates
  useEffect(() => {
    if (!game) return;

    const unsubscribe = subscribeToGame(game.id, (updatedGame) => {
      setGame(updatedGame);
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.id]);

  const handleCreateGame = async () => {
    try {
      setError(null);
      const newGame = await createGame(3, 4);
      const playerName = prompt('Enter your name:') || 'Player 1';
      const player = await joinGame(newGame.id, playerName);

      setCurrentPlayerId(player.id);
      const gameWithPlayers = await getGame(newGame.id);
      setGame(gameWithPlayers);
      setAppState('lobby');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    }
  };

  const handleJoinGame = async (gameId: string, playerName: string) => {
    try {
      setError(null);
      const player = await joinGame(gameId, playerName);
      setCurrentPlayerId(player.id);

      const gameWithPlayers = await getGame(gameId);
      setGame(gameWithPlayers);
      setAppState('lobby');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
      alert(err instanceof Error ? err.message : 'Failed to join game');
    }
  };

  const handleStartGame = async () => {
    if (!game) return;

    try {
      setError(null);
      await startGame(game.id);
      await addGameLog(
        game.id,
        'Game started! Players select starting choices.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
      alert(err instanceof Error ? err.message : 'Failed to start game');
    }
  };

  const handleLeaveGame = () => {
    setGame(null);
    setCurrentPlayerId(null);
    setAppState('menu');
  };

  const handleStartingChoice = async (choiceIndex: number) => {
    if (!game || !currentPlayerId) return;

    const choice = STARTING_CHOICES[choiceIndex];
    if (!choice) return;

    const currentPlayer = game.players.find((p) => p.id === currentPlayerId);
    if (!currentPlayer) return;

    // Update player with starting choice rewards
    await updatePlayer(currentPlayerId, {
      gold: currentPlayer.gold + choice.rewards.gold,
      political_influence:
        currentPlayer.political_influence + choice.rewards.political_influence,
      buildings: choice.rewards.buildings
        ? [
            ...(currentPlayer.buildings as string[]),
            ...choice.rewards.buildings,
          ]
        : currentPlayer.buildings,
      henchman_cards: choice.rewards.henchman_cards
        ? [
            ...(currentPlayer.henchman_cards as string[]),
            ...Array(choice.rewards.henchman_cards).fill('Henchman Card'),
          ]
        : currentPlayer.henchman_cards,
    });

    await addGameLog(
      game.id,
      `${currentPlayer.player_name} chose ${choice.name}`
    );

    // Check if all players have chosen
    const nextPlayer = game.players[currentPlayer.player_order + 1];
    if (nextPlayer) {
      await updateGame(game.id, {
        current_player_id: nextPlayer.id,
      });
    } else {
      // All players have chosen, start election
      await updateGame(game.id, {
        status: 'election',
        current_player_id: game.players[0]?.id || null,
        voting_results: {},
      });
      await addGameLog(game.id, 'Starting Mayor Election!');
    }
  };

  const handleCastVote = async (candidateId: number) => {
    if (!game || !currentPlayerId) return;

    const currentPlayer = game.players.find((p) => p.id === currentPlayerId);
    const candidate = game.players.find(
      (p) => p.player_order === candidateId - 1
    );

    if (!currentPlayer || !candidate) return;

    // Update voting results
    const votingResults =
      (game.voting_results as Record<
        string,
        { votes: number; voters: string[] }
      >) || {};
    const candidateKey = candidate.id;

    if (!votingResults[candidateKey]) {
      votingResults[candidateKey] = { votes: 0, voters: [] };
    }

    votingResults[candidateKey].votes += currentPlayer.political_influence;
    votingResults[candidateKey].voters.push(currentPlayer.player_name);

    await addGameLog(
      game.id,
      `${currentPlayer.player_name} voted for ${candidate.player_name} (${currentPlayer.political_influence} influence)`
    );

    // Move to next voter
    const nextPlayer = game.players[currentPlayer.player_order + 1];

    if (nextPlayer) {
      await updateGame(game.id, {
        voting_results: votingResults,
        current_player_id: nextPlayer.id,
      });
    } else {
      // All players have voted, tally results
      let maxVotes = 0;
      let winnerId = game.players[0]?.id || '';

      Object.entries(votingResults).forEach(([playerId, result]) => {
        if (result.votes > maxVotes) {
          maxVotes = result.votes;
          winnerId = playerId;
        }
      });

      const winner = game.players.find((p) => p.id === winnerId);

      await updateGame(game.id, {
        voting_results: votingResults,
        mayor_player_id: winnerId,
        status: 'role_selection',
        current_player_id: winnerId,
      });

      await addGameLog(
        game.id,
        `${winner?.player_name || 'Player'} elected as Mayor!`
      );
    }
  };

  const handleContinueFromElection = async () => {
    if (!game) return;

    await updateGame(game.id, {
      status: 'role_selection',
      current_player_id: game.mayor_player_id,
    });
  };

  const handleRoleSelection = async (roleId: string) => {
    if (!game || !currentPlayerId) return;

    const currentPlayer = game.players.find((p) => p.id === currentPlayerId);
    if (!currentPlayer) return;

    await updatePlayer(currentPlayerId, {
      role: roleId,
      extra_servants: roleId === 'recruiter' ? 1 : currentPlayer.extra_servants,
    });

    await addGameLog(
      game.id,
      `${currentPlayer.player_name} selected ${ROLES[roleId]?.name || roleId}`
    );

    // Determine next player in counter-clockwise order from mayor
    const mayorIndex = game.players.findIndex(
      (p) => p.id === game.mayor_player_id
    );
    const currentIndex = game.players.findIndex(
      (p) => p.id === currentPlayerId
    );

    // Find next player who hasn't selected a role (counter-clockwise from mayor)
    let nextIndex =
      (currentIndex - 1 + game.players.length) % game.players.length;
    let nextPlayer = game.players[nextIndex];

    // Check if all players have roles
    const playersWithRoles = game.players.filter((p) => p.role).length;

    if (playersWithRoles + 1 >= game.players.length) {
      // All players have roles, move to policy selection
      await updateGame(game.id, {
        status: 'policy_selection',
        current_player_id: game.mayor_player_id,
      });
    } else {
      // Move to next player who needs to select
      while (nextPlayer && nextPlayer.role && nextIndex !== mayorIndex) {
        nextIndex = (nextIndex - 1 + game.players.length) % game.players.length;
        nextPlayer = game.players[nextIndex];
      }

      if (nextPlayer && !nextPlayer.role) {
        await updateGame(game.id, {
          current_player_id: nextPlayer.id,
        });
      }
    }
  };

  const handlePolicySelection = async (policyId: string) => {
    if (!game) return;

    await updateGame(game.id, {
      status: 'action_placement',
      current_policy: policyId,
      current_player_id: game.mayor_player_id,
    });

    await addGameLog(
      game.id,
      `Mayor enacted ${policyId.replace(/_/g, ' ')} policy`
    );

    // Apply policy effects (simplified for now)
    if (policyId === 'martial_law') {
      for (const player of game.players) {
        await updatePlayer(player.id, {
          political_influence: Math.max(0, player.political_influence - 1),
        });
      }
      await addGameLog(game.id, 'All players lose 1 political influence');
    }
  };

  const handlePlaceServant = async (locationId: string, slotIndex: number) => {
    if (!game || !currentPlayerId) return;

    const currentPlayer = game.players.find((p) => p.id === currentPlayerId);
    if (!currentPlayer || currentPlayer.servants_available <= 0) return;

    const actionSlots =
      (game.action_slots as Record<string, (string | null)[]>) || {};

    if (!actionSlots[locationId]) {
      actionSlots[locationId] = [];
    }

    if (actionSlots[locationId][slotIndex]) {
      alert('Slot already occupied!');
      return;
    }

    actionSlots[locationId][slotIndex] = currentPlayerId;

    await updateGame(game.id, {
      action_slots: actionSlots,
    });

    await updatePlayer(currentPlayerId, {
      servants_available: currentPlayer.servants_available - 1,
    });

    await addGameLog(
      game.id,
      `${currentPlayer.player_name} placed servant at ${locationId.replace(/_/g, ' ')}`
    );
  };

  const handleNextPhase = async () => {
    if (!game || !currentPlayerId) return;

    const currentPlayerIndex = game.players.findIndex(
      (p) => p.id === currentPlayerId
    );
    const mayorIndex = game.players.findIndex(
      (p) => p.id === game.mayor_player_id
    );

    // Check if current player still has servants
    const currentPlayer = game.players[currentPlayerIndex];
    if (currentPlayer && currentPlayer.servants_available > 0) {
      alert('You still have servants to place!');
      return;
    }

    // Move to next player
    const nextIndex = (currentPlayerIndex + 1) % game.players.length;
    const nextPlayer = game.players[nextIndex];

    if (nextIndex === mayorIndex) {
      // Round complete
      await endRound();
    } else if (nextPlayer) {
      await updateGame(game.id, {
        current_player_id: nextPlayer.id,
      });
    }
  };

  const endRound = async () => {
    if (!game) return;

    // Reset servants for all players
    for (const player of game.players) {
      await updatePlayer(player.id, {
        servants_available: player.servants_total + player.extra_servants,
        extra_servants: 0,
        role: null,
      });
    }

    const nextRound = game.current_round + 1;

    if (nextRound > game.max_rounds) {
      // Game finished
      await updateGame(game.id, {
        status: 'finished',
        current_round: nextRound,
      });
      await addGameLog(game.id, 'Game finished!');
    } else {
      // Start next round
      await updateGame(game.id, {
        status: 'election',
        current_round: nextRound,
        current_policy: null,
        action_slots: {},
        voting_results: {},
        current_player_id: game.players[0]?.id || null,
      });
      await addGameLog(game.id, `Starting Round ${nextRound}`);
    }
  };

  if (!game || appState === 'menu') {
    return (
      <div className="app-container">
        {error && (
          <div
            style={{
              color: '#ff6b6b',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}
        <LobbyPanel
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
        />
      </div>
    );
  }

  if (appState === 'lobby' && game.status === 'lobby') {
    return (
      <div className="app-container">
        {error && (
          <div
            style={{
              color: '#ff6b6b',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}
        <GameLobby
          game={game}
          currentPlayerId={currentPlayerId}
          onStartGame={handleStartGame}
          onLeaveGame={handleLeaveGame}
        />
      </div>
    );
  }

  // Convert database players to local format
  const localPlayers = game.players.map(dbPlayerToLocal);
  const currentPlayer = game.players.find((p) => p.id === currentPlayerId);
  const currentPlayerLocal = currentPlayer
    ? dbPlayerToLocal(currentPlayer)
    : undefined;
  const mayorIndex = game.players.findIndex(
    (p) => p.id === game.mayor_player_id
  );
  const mayor = mayorIndex >= 0 ? localPlayers[mayorIndex] : undefined;

  // Get available roles for role selection
  const takenRoles = game.players
    .filter((p) => p.role)
    .map((p) => p.role as string);
  const availableRoles = Object.keys(ROLES).filter(
    (roleId) => !takenRoles.includes(roleId)
  );

  const gameLog = Array.isArray(game.game_log) ? game.game_log : [];
  const lastTenLogs = gameLog.slice(-10).map((log) => String(log));

  return (
    <div className="app-container">
      {/* Game Header */}
      <div className="game-header">
        <h1 className="game-title">Noble Dynasty</h1>
        <div className="game-status">
          <div className="status-item">
            Round: {game.current_round} / {game.max_rounds}
          </div>
          <div className="mayor-crown">Mayor: {mayor?.name || '-'}</div>
          <div className="status-item">
            Phase: {game.status.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      {/* Player Info */}
      <PlayerInfo
        players={localPlayers}
        currentPlayerIndex={localPlayers.findIndex(
          (p) => p.id === currentPlayerLocal?.id
        )}
        mayorIndex={mayorIndex}
      />

      {/* Starting Choices Modal */}
      {game.status === 'starting_choices' &&
        game.current_player_id === currentPlayerId && (
          <StartingChoicesModal
            playerName={currentPlayer?.player_name || 'Player'}
            onConfirm={handleStartingChoice}
          />
        )}

      {/* Mayor Election Modal */}
      {game.status === 'election' && (
        <MayorElectionModal
          currentRound={game.current_round}
          currentVoter={
            currentPlayer && game.current_player_id === currentPlayerId
              ? dbPlayerToLocal(currentPlayer)
              : localPlayers[0]!
          }
          players={localPlayers}
          votingResults={
            game.voting_results as Record<
              number,
              { votes: number; voters: string[] }
            >
          }
          showResults={game.players.every((p) => {
            const votingResults = game.voting_results as Record<
              string,
              { votes: number }
            >;
            return Object.keys(votingResults).includes(p.id);
          })}
          mayorName={mayor?.name || 'Unknown'}
          onCastVote={handleCastVote}
          onContinue={handleContinueFromElection}
        />
      )}

      {/* Role Selection Modal */}
      {game.status === 'role_selection' &&
        currentPlayer &&
        !currentPlayer.role &&
        game.current_player_id === currentPlayerId && (
          <RoleSelectionModal
            playerName={currentPlayer.player_name}
            availableRoles={availableRoles}
            onConfirm={handleRoleSelection}
          />
        )}

      {/* Policy Selection Modal */}
      {game.status === 'policy_selection' &&
        game.current_player_id === currentPlayerId && (
          <PolicySelectionModal
            mayorName={mayor?.name || 'Mayor'}
            onConfirm={handlePolicySelection}
          />
        )}

      {/* Game Board */}
      {game.status === 'action_placement' && (
        <>
          <GameBoard
            actionSlots={game.action_slots as Record<string, (number | null)[]>}
            currentPolicy={game.current_policy}
            currentPlayerId={currentPlayerLocal?.id || 0}
            onPlaceServant={handlePlaceServant}
          />

          <div className="controls">
            <div className="control-buttons">
              <button
                className="btn btn-primary"
                onClick={handleNextPhase}
                disabled={
                  game.current_player_id !== currentPlayerId ||
                  (currentPlayer && currentPlayer.servants_available > 0)
                }
              >
                {game.current_player_id === currentPlayerId &&
                currentPlayer &&
                currentPlayer.servants_available > 0
                  ? `Place ${currentPlayer.servants_available} Servant(s)`
                  : game.current_player_id === currentPlayerId
                    ? 'End Turn'
                    : 'Waiting for other players...'}
              </button>
              <button className="btn btn-danger" onClick={handleLeaveGame}>
                Leave Game
              </button>
            </div>

            <div className="game-log">
              {lastTenLogs.map((log, index) => (
                <div key={index} className="log-entry">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Game Finished */}
      {game.status === 'finished' && (
        <div className="controls">
          <h2>Game Over!</h2>
          <div className="game-log">
            {lastTenLogs.map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleLeaveGame}>
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
