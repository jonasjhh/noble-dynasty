import type { Player } from '../types';

/**
 * Create a new player with default values
 */
export function createPlayer(id: number, name: string): Player {
  return {
    id,
    name,
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
  };
}

/**
 * Calculate total player wealth (gold + goods value)
 */
export function calculatePlayerWealth(player: Player): number {
  const goodsValue = Object.entries(player.goods).reduce(
    (total, [type, count]) => {
      // Goods values: grain=1, cloth=2, tools=3, jewelry=4, spices=5
      const values: Record<string, number> = {
        grain: 1,
        cloth: 2,
        tools: 3,
        jewelry: 4,
        spices: 5,
      };
      return total + (values[type] || 0) * count;
    },
    0
  );

  return player.gold + goodsValue;
}

/**
 * Get available servants for a player (including extra servants)
 */
export function getAvailableServants(player: Player): number {
  return player.servants_available + player.extra_servants;
}

/**
 * Check if player can afford a building
 */
export function canAffordBuilding(
  player: Player,
  buildingCost: number,
  isArchitect = false
): boolean {
  const discount = isArchitect ? 3 : 0;
  const finalCost = Math.max(0, buildingCost - discount);
  return player.gold >= finalCost;
}

/**
 * Apply starting choice rewards to a player
 */
export function applyStartingChoice(
  player: Player,
  rewards: {
    gold: number;
    political_influence: number;
    buildings?: string[];
    henchman_cards?: number;
  }
): Player {
  return {
    ...player,
    gold: player.gold + rewards.gold,
    political_influence:
      player.political_influence + rewards.political_influence,
    buildings: rewards.buildings
      ? [...player.buildings, ...rewards.buildings]
      : player.buildings,
    henchman_cards:
      rewards.henchman_cards !== undefined
        ? [
            ...player.henchman_cards,
            ...Array(rewards.henchman_cards).fill('Henchman Card'),
          ]
        : player.henchman_cards,
  };
}

/**
 * Format player name with role
 */
export function formatPlayerName(
  player: Player,
  roleNames?: Record<string, string>
): string {
  if (!player.role || !roleNames) {
    return player.name;
  }
  const roleName = roleNames[player.role];
  return roleName ? `${player.name} (${roleName})` : player.name;
}
