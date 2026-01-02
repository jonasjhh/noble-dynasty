import { LOCATIONS, POLICIES } from '../data';

interface GameBoardProps {
  actionSlots: Record<string, (number | null)[]>;
  currentPolicy: string | null;
  currentPlayerId?: number;
  onPlaceServant: (locationId: string, slotIndex: number) => void;
}

export function GameBoard({
  actionSlots,
  currentPolicy,
  onPlaceServant,
}: GameBoardProps) {
  return (
    <div className="game-board">
      <div className="locations-panel">
        <h3 className="panel-title">City Locations</h3>
        <div id="locations-container">
          {Object.entries(LOCATIONS).map(([locationId, location]) => (
            <div
              key={locationId}
              className={`location ${location.closed ? 'closed' : ''}`}
            >
              <div className="location-name">{location.name}</div>
              <div style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                {location.description}
              </div>
              <div className="location-slots">
                {actionSlots[locationId]?.map((occupant, index) => (
                  <div
                    key={index}
                    className={`servant-slot ${occupant !== null ? 'occupied' : ''} ${location.closed ? 'blocked' : ''}`}
                    onClick={() => {
                      if (occupant === null && !location.closed) {
                        onPlaceServant(locationId, index);
                      }
                    }}
                  >
                    {occupant !== null ? occupant : ''}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="actions-panel">
        <h3 className="panel-title">Actions & Policies</h3>

        <div className="location">
          <div className="location-name">
            Current Policy: {currentPolicy ? POLICIES[currentPolicy]?.name : 'None'}
          </div>
          <div>
            {currentPolicy
              ? POLICIES[currentPolicy]?.description
              : 'No policy is currently active.'}
          </div>
        </div>
      </div>
    </div>
  );
}
