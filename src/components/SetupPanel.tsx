interface SetupPanelProps {
  onStartGame: (playerCount: number) => void;
}

export function SetupPanel({ onStartGame }: SetupPanelProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const playerCount = parseInt(formData.get('playerCount') as string);
    onStartGame(playerCount);
  };

  return (
    <div className="setup-panel">
      <h2 className="game-title">Noble Dynasty</h2>
      <p>
        Command houses. Manipulate the court. Deceive your rivals. Rule the
        city. Forge your dynasty.
      </p>
      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="playerCount">Number of Players:</label>
          <select id="playerCount" name="playerCount" defaultValue="4">
            <option value="3">3 Players</option>
            <option value="4">4 Players</option>
            <option value="5">5 Players</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Start Game
        </button>
      </form>
    </div>
  );
}
