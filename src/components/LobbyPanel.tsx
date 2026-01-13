import { useState } from 'react';

interface LobbyPanelProps {
  onCreateGame: () => void;
  onJoinGame: (gameId: string, playerName: string) => void;
}

export function LobbyPanel({ onCreateGame, onJoinGame }: LobbyPanelProps) {
  const [mode, setMode] = useState<'menu' | 'join'>('menu');
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim() && playerName.trim()) {
      onJoinGame(gameId.trim(), playerName.trim());
    }
  };

  if (mode === 'join') {
    return (
      <div className="setup-panel">
        <h1>Join Game</h1>
        <p>Enter the game ID and your name to join an existing game.</p>

        <form onSubmit={handleJoinSubmit}>
          <div className="form-group">
            <label htmlFor="gameId">Game ID:</label>
            <input
              type="text"
              id="gameId"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter game ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="playerName">Your Name:</label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              required
              maxLength={20}
            />
          </div>

          <div
            style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}
          >
            <button type="submit" className="btn btn-primary">
              Join Game
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setMode('menu')}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="setup-panel">
      <h1>Noble Dynasty</h1>
      <p>
        A strategic multiplayer game of political intrigue and worker placement.
        Create a new game or join an existing one.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginTop: '30px',
        }}
      >
        <button className="btn btn-primary" onClick={onCreateGame}>
          Create New Game
        </button>
        <button className="btn btn-primary" onClick={() => setMode('join')}>
          Join Existing Game
        </button>
      </div>
    </div>
  );
}
