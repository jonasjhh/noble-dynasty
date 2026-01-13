import type { Player } from '../types';

interface MayorElectionModalProps {
  currentRound: number;
  currentVoter: Player;
  players: Player[];
  votingResults: Record<number, { votes: number; voters: string[] }>;
  showResults: boolean;
  mayorName: string;
  onCastVote: (candidateId: number) => void;
  onContinue: () => void;
}

export function MayorElectionModal({
  currentRound,
  currentVoter,
  players,
  votingResults,
  showResults,
  mayorName,
  onCastVote,
  onContinue,
}: MayorElectionModalProps) {
  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <h2 className="modal-title">Mayor Election - Round {currentRound}</h2>

        {!showResults && (
          <>
            <div className="voting-section">
              <h3>{currentVoter.name} is Voting</h3>
              <div
                style={{
                  marginBottom: '15px',
                  fontSize: '0.9rem',
                  color: '#cd853f',
                }}
              >
                Voting Power: {currentVoter.political_influence} influence
              </div>
              <div className="vote-buttons">
                {players.map((player) => (
                  <button
                    key={player.id}
                    className="btn"
                    onClick={() => onCastVote(player.id)}
                  >
                    Vote for {player.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="voting-section">
              <h3>Current Vote Tally:</h3>
              <div>
                {players.map((player) => {
                  const result = votingResults[player.id];
                  return (
                    <div key={player.id} style={{ marginBottom: '8px' }}>
                      <strong>{player.name}:</strong> {result?.votes || 0} votes
                      {result?.voters && result.voters.length > 0 && (
                        <>
                          <br />
                          <span
                            style={{ fontSize: '0.8rem', color: '#cd853f' }}
                          >
                            Voted by: {result.voters.join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="voting-section">
              <h3>Player Influence:</h3>
              <div>
                {players.map((player) => (
                  <div key={player.id} style={{ marginBottom: '5px' }}>
                    <strong>{player.name}:</strong> {player.political_influence}{' '}
                    influence
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {showResults && (
          <div id="election-results">
            <h3>Final Election Results:</h3>
            <div>
              {players.map((player) => {
                const result = votingResults[player.id];
                return (
                  <div key={player.id}>
                    {player.name}: {result?.votes || 0} votes
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: '15px',
                fontWeight: 'bold',
                color: '#daa520',
              }}
            >
              🏆 {mayorName} is elected Mayor!
            </div>
            <button className="btn btn-primary" onClick={onContinue}>
              Continue to Role Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
