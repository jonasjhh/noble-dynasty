import { useState, useCallback } from 'react';
import { GameEngine } from './GameEngine';
import { SetupPanel } from './components/SetupPanel';
import { StartingChoicesModal } from './components/StartingChoicesModal';
import { MayorElectionModal } from './components/MayorElectionModal';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { PolicySelectionModal } from './components/PolicySelectionModal';
import { PlayerInfo } from './components/PlayerInfo';
import { GameBoard } from './components/GameBoard';
import { STARTING_CHOICES, ROLES } from './data';

function App() {
  const [engine] = useState(() => new GameEngine());
  const [, forceUpdate] = useState({});
  const refresh = useCallback(() => forceUpdate({}), []);

  const state = engine.getState();

  const handleStartGame = (playerCount: number) => {
    engine.startNewGame(playerCount);
    refresh();
  };

  const handleStartingChoice = (choiceIndex: number) => {
    const choice = STARTING_CHOICES[choiceIndex];
    if (!choice) return;

    engine.applyStartingChoice(
      engine.currentStartingPlayer,
      choiceIndex,
      choice
    );
    engine.currentStartingPlayer++;

    if (engine.currentStartingPlayer >= engine.players.length) {
      engine.gameState = 'election';
      engine.startMayorElection();
    }

    refresh();
  };

  const handleCastVote = (candidateId: number) => {
    engine.castVote(candidateId);

    if (engine.currentVoter >= engine.players.length) {
      const newMayorIndex = engine.tallyVotes();
      engine.mayorIndex = newMayorIndex;
    }

    refresh();
  };

  const handleContinueFromElection = () => {
    engine.gameState = 'role_selection';
    engine.startRoleSelection();
    refresh();
  };

  const handleRoleSelection = (roleId: string) => {
    const playerIndex =
      engine.roleSelectionOrder[engine.currentRoleSelector] || 0;
    engine.selectRole(playerIndex, roleId);
    engine.currentRoleSelector++;

    if (engine.currentRoleSelector >= engine.roleSelectionOrder.length) {
      engine.gameState = 'policy_selection';
    }

    refresh();
  };

  const handlePolicySelection = (policyId: string) => {
    engine.currentPolicy = policyId;
    engine.applyPolicy(policyId);
    engine.gameState = 'action_placement';
    engine.currentPlayerIndex = engine.mayorIndex;
    refresh();
  };

  const handlePlaceServant = (locationId: string, slotIndex: number) => {
    const currentPlayer = engine.getCurrentPlayer();
    if (!currentPlayer) return;

    const success = engine.placeServant(locationId, slotIndex, currentPlayer.id);
    if (success) {
      refresh();
    }
  };

  const handleNextPhase = () => {
    engine.currentPlayerIndex =
      (engine.currentPlayerIndex + 1) % engine.players.length;

    if (engine.currentPlayerIndex === engine.mayorIndex) {
      engine.endRound();
      if (engine.gameState !== 'finished') {
        engine.gameState = 'election';
        engine.startMayorElection();
      }
    }
    refresh();
  };

  const handleReset = () => {
    engine.gameState = 'setup';
    engine.players = [];
    engine.currentRound = 1;
    engine.gameLog = [];
    refresh();
  };

  const currentPlayer = engine.getCurrentPlayer();
  const mayor = engine.getMayor();

  // Get available roles for role selection
  const takenRoles = Object.values(state.selectedRoles);
  const availableRoles = Object.keys(ROLES).filter(
    (roleId) => !takenRoles.includes(roleId)
  );

  return (
    <div className="app-container">
      {/* Setup Panel */}
      {state.gameState === 'setup' && (
        <SetupPanel onStartGame={handleStartGame} />
      )}

      {/* Game Header */}
      {state.gameState !== 'setup' && (
        <>
          <div className="game-header">
            <h1 className="game-title">Noble Dynasty</h1>
            <div className="game-status">
              <div className="status-item">
                Round: {state.currentRound} / {state.maxRounds}
              </div>
              <div className="mayor-crown">Mayor: {mayor?.name || '-'}</div>
              <div className="status-item">
                Phase: {state.gameState.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Player Info */}
          <PlayerInfo
            players={state.players}
            currentPlayerIndex={state.currentPlayerIndex}
            mayorIndex={state.mayorIndex}
          />
        </>
      )}

      {/* Starting Choices Modal */}
      {state.gameState === 'starting_choices' &&
        state.currentStartingPlayer < state.players.length && (
          <StartingChoicesModal
            playerName={
              state.players[state.currentStartingPlayer]?.name || 'Player'
            }
            onConfirm={handleStartingChoice}
          />
        )}

      {/* Mayor Election Modal */}
      {state.gameState === 'election' && (
        <MayorElectionModal
          currentRound={state.currentRound}
          currentVoter={state.players[state.currentVoter] || state.players[0]!}
          players={state.players}
          votingResults={state.votingResults}
          showResults={state.currentVoter >= state.players.length}
          mayorName={mayor?.name || 'Unknown'}
          onCastVote={handleCastVote}
          onContinue={handleContinueFromElection}
        />
      )}

      {/* Role Selection Modal */}
      {state.gameState === 'role_selection' &&
        state.currentRoleSelector < state.roleSelectionOrder.length && (
          <RoleSelectionModal
            playerName={
              state.players[
                state.roleSelectionOrder[state.currentRoleSelector] || 0
              ]?.name || 'Player'
            }
            availableRoles={availableRoles}
            onConfirm={handleRoleSelection}
          />
        )}

      {/* Policy Selection Modal */}
      {state.gameState === 'policy_selection' && (
        <PolicySelectionModal
          mayorName={mayor?.name || 'Mayor'}
          onConfirm={handlePolicySelection}
        />
      )}

      {/* Game Board */}
      {state.gameState === 'action_placement' && (
        <>
          <GameBoard
            actionSlots={state.actionSlots}
            currentPolicy={state.currentPolicy}
            currentPlayerId={currentPlayer?.id || 0}
            onPlaceServant={handlePlaceServant}
          />

          <div className="controls">
            <div className="control-buttons">
              <button
                className="btn btn-primary"
                onClick={handleNextPhase}
                disabled={currentPlayer && currentPlayer.servants_available > 0}
              >
                {currentPlayer && currentPlayer.servants_available > 0
                  ? `${currentPlayer.name}: Place Servant`
                  : 'Next Player'}
              </button>
              <button className="btn btn-danger" onClick={handleReset}>
                Reset Game
              </button>
            </div>

            <div className="game-log">
              {state.gameLog.map((log, index) => (
                <div key={index} className="log-entry">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Game Finished */}
      {state.gameState === 'finished' && (
        <div className="controls">
          <h2>Game Over!</h2>
          <div className="game-log">
            {state.gameLog.map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleReset}>
            New Game
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
