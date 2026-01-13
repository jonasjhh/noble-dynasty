import { useState } from 'react';
import type { GameWithPlayers } from '../services/gameService';

interface GameLobbyProps {
  game: GameWithPlayers;
  currentPlayerId: string | null;
  onStartGame: () => void;
  onLeaveGame: () => void;
}

export function GameLobby({
  game,
  currentPlayerId,
  onStartGame,
  onLeaveGame,
}: GameLobbyProps) {
  const [copied, setCopied] = useState(false);

  const players = game.players || [];
  const playerCount = players.length;
  const canStart =
    playerCount >= game.min_players && playerCount <= game.max_players;
  const isHost = currentPlayerId === players[0]?.id;

  const copyGameId = async () => {
    try {
      await navigator.clipboard.writeText(game.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="setup-panel">
      <h1>Game Lobby</h1>

      <div className="form-group" style={{ textAlign: 'left' }}>
        <label>Game ID:</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <code
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '5px',
              fontSize: '0.9rem',
              wordBreak: 'break-all',
            }}
          >
            {game.id}
          </code>
          <button
            type="button"
            className="btn btn-primary"
            onClick={copyGameId}
            style={{ whiteSpace: 'nowrap' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', marginTop: '5px', color: '#a8d5ff' }}>
          Share this ID with other players so they can join
        </p>
      </div>

      <div className="form-group" style={{ textAlign: 'left' }}>
        <label>
          Players ({playerCount}/{game.max_players}):
        </label>
        <div style={{ marginTop: '10px' }}>
          {players.map((player, index) => (
            <div
              key={player.id}
              style={{
                padding: '10px',
                marginBottom: '8px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '5px',
                border:
                  player.id === currentPlayerId
                    ? '2px solid #4a9eff'
                    : '2px solid transparent',
              }}
            >
              <strong style={{ color: '#daa520' }}>
                {player.player_name}
                {index === 0 && ' (Host)'}
                {player.id === currentPlayerId && ' (You)'}
              </strong>
            </div>
          ))}

          {playerCount < game.min_players && (
            <p
              style={{
                color: '#ff6b6b',
                marginTop: '10px',
                fontSize: '0.9rem',
              }}
            >
              Waiting for at least {game.min_players - playerCount} more
              player(s)...
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          marginTop: '20px',
        }}
      >
        {isHost && (
          <button
            className="btn btn-primary"
            onClick={onStartGame}
            disabled={!canStart}
          >
            {canStart
              ? 'Start Game'
              : `Need ${game.min_players - playerCount} More Player(s)`}
          </button>
        )}
        {!isHost && (
          <p style={{ color: '#a8d5ff', fontStyle: 'italic' }}>
            Waiting for host to start the game...
          </p>
        )}
        <button className="btn btn-danger" onClick={onLeaveGame}>
          Leave Game
        </button>
      </div>
    </div>
  );
}
