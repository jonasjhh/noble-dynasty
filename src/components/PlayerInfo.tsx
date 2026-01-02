import type { Player } from '../types';
import { ROLES } from '../data';

interface PlayerInfoProps {
  players: Player[];
  currentPlayerIndex: number;
  mayorIndex: number;
}

export function PlayerInfo({
  players,
  currentPlayerIndex,
  mayorIndex,
}: PlayerInfoProps) {
  return (
    <div className="player-info">
      {players.map((player, index) => {
        const goodsDisplay =
          Object.entries(player.goods)
            .map(([type, count]) => `${type}: ${count}`)
            .join(', ') || 'None';

        return (
          <div
            key={player.id}
            className={`player-card ${index === currentPlayerIndex ? 'active' : ''} ${index === mayorIndex ? 'mayor' : ''}`}
          >
            <div className="player-name">{player.name}</div>
            {player.role && (
              <div className="player-role">
                {ROLES[player.role]?.name || player.role}
              </div>
            )}
            <div className="resource-grid">
              <div>Gold: {player.gold}</div>
              <div>Influence: {player.political_influence}</div>
              <div>
                Servants: {player.servants_available}/{player.servants_total}
              </div>
              <div>VPs: {player.victory_points}</div>
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
              <div className="goods-display">
                <span>Goods: </span>
                <span>{goodsDisplay}</span>
              </div>
            </div>
            {player.buildings.length > 0 && (
              <div style={{ marginTop: '5px', fontSize: '0.8rem' }}>
                Buildings: {player.buildings.join(', ')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
