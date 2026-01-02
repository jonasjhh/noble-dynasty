import { describe, it, expect } from 'vitest';
import {
  createPlayer,
  calculatePlayerWealth,
  getAvailableServants,
  canAffordBuilding,
  applyStartingChoice,
  formatPlayerName,
} from '../utils/gameUtils';

describe('Game Utilities', () => {
  describe('createPlayer', () => {
    it('should create a player with correct default values', () => {
      const player = createPlayer(1, 'Alice');

      expect(player.id).toBe(1);
      expect(player.name).toBe('Alice');
      expect(player.gold).toBe(5);
      expect(player.goods).toEqual({});
      expect(player.political_influence).toBe(1);
      expect(player.servants_available).toBe(2);
      expect(player.servants_total).toBe(2);
      expect(player.victory_points).toBe(0);
      expect(player.role).toBeNull();
      expect(player.buildings).toEqual([]);
      expect(player.henchman_cards).toEqual([]);
      expect(player.news_cards).toEqual([]);
      expect(player.extra_servants).toBe(0);
    });

    it('should create multiple unique players', () => {
      const player1 = createPlayer(1, 'Alice');
      const player2 = createPlayer(2, 'Bob');

      expect(player1.id).not.toBe(player2.id);
      expect(player1.name).not.toBe(player2.name);
    });
  });

  describe('calculatePlayerWealth', () => {
    it('should calculate wealth with only gold', () => {
      const player = createPlayer(1, 'Alice');
      player.gold = 10;

      expect(calculatePlayerWealth(player)).toBe(10);
    });

    it('should calculate wealth with gold and goods', () => {
      const player = createPlayer(1, 'Alice');
      player.gold = 5;
      player.goods = {
        grain: 2, // 2 * 1 = 2
        cloth: 1, // 1 * 2 = 2
        tools: 1, // 1 * 3 = 3
      };

      expect(calculatePlayerWealth(player)).toBe(12); // 5 + 2 + 2 + 3
    });

    it('should handle all goods types correctly', () => {
      const player = createPlayer(1, 'Alice');
      player.gold = 0;
      player.goods = {
        grain: 1, // 1
        cloth: 1, // 2
        tools: 1, // 3
        jewelry: 1, // 4
        spices: 1, // 5
      };

      expect(calculatePlayerWealth(player)).toBe(15); // 1 + 2 + 3 + 4 + 5
    });

    it('should handle empty goods', () => {
      const player = createPlayer(1, 'Alice');
      player.gold = 7;
      player.goods = {};

      expect(calculatePlayerWealth(player)).toBe(7);
    });
  });

  describe('getAvailableServants', () => {
    it('should return available servants without extras', () => {
      const player = createPlayer(1, 'Alice');
      player.servants_available = 2;
      player.extra_servants = 0;

      expect(getAvailableServants(player)).toBe(2);
    });

    it('should include extra servants', () => {
      const player = createPlayer(1, 'Alice');
      player.servants_available = 2;
      player.extra_servants = 1;

      expect(getAvailableServants(player)).toBe(3);
    });

    it('should handle zero servants', () => {
      const player = createPlayer(1, 'Alice');
      player.servants_available = 0;
      player.extra_servants = 0;

      expect(getAvailableServants(player)).toBe(0);
    });
  });

  describe('canAffordBuilding', () => {
    it('should return true when player has enough gold', () => {
      const player = createPlayer(1, 'Alice');
      player.gold = 10;

      expect(canAffordBuilding(player, 8)).toBe(true);
    });

    it('should return false when player lacks gold', () => {
      const player = createPlayer(1, 'Alice');
      player.gold = 5;

      expect(canAffordBuilding(player, 8)).toBe(false);
    });

    it('should apply architect discount', () => {
      const player = createPlayer(1, 'Alice');
      player.gold = 6;

      expect(canAffordBuilding(player, 8, false)).toBe(false);
      expect(canAffordBuilding(player, 8, true)).toBe(true); // 8 - 3 = 5
    });

    it('should handle exact cost', () => {
      const player = createPlayer(1, 'Alice');
      player.gold = 8;

      expect(canAffordBuilding(player, 8)).toBe(true);
    });

    it('should not go below zero cost with architect discount', () => {
      const player = createPlayer(1, 'Alice');
      player.gold = 1;

      expect(canAffordBuilding(player, 2, true)).toBe(true); // Cost becomes 0
    });
  });

  describe('applyStartingChoice', () => {
    it('should apply basic rewards', () => {
      const player = createPlayer(1, 'Alice');
      const rewards = {
        gold: 3,
        political_influence: 2,
      };

      const updated = applyStartingChoice(player, rewards);

      expect(updated.gold).toBe(8); // 5 + 3
      expect(updated.political_influence).toBe(3); // 1 + 2
    });

    it('should add buildings', () => {
      const player = createPlayer(1, 'Alice');
      const rewards = {
        gold: 2,
        political_influence: 1,
        buildings: ['guardhouse', 'library'],
      };

      const updated = applyStartingChoice(player, rewards);

      expect(updated.buildings).toEqual(['guardhouse', 'library']);
      expect(updated.gold).toBe(7);
      expect(updated.political_influence).toBe(2);
    });

    it('should add henchman cards', () => {
      const player = createPlayer(1, 'Alice');
      const rewards = {
        gold: 4,
        political_influence: 3,
        henchman_cards: 2,
      };

      const updated = applyStartingChoice(player, rewards);

      expect(updated.henchman_cards).toHaveLength(2);
      expect(updated.gold).toBe(9);
      expect(updated.political_influence).toBe(4);
    });

    it('should not mutate original player', () => {
      const player = createPlayer(1, 'Alice');
      const originalGold = player.gold;
      const rewards = {
        gold: 5,
        political_influence: 1,
      };

      applyStartingChoice(player, rewards);

      expect(player.gold).toBe(originalGold);
    });
  });

  describe('formatPlayerName', () => {
    it('should return player name without role', () => {
      const player = createPlayer(1, 'Alice');

      expect(formatPlayerName(player)).toBe('Alice');
    });

    it('should format player name with role', () => {
      const player = createPlayer(1, 'Alice');
      player.role = 'mayor';
      const roleNames = { mayor: 'Mayor' };

      expect(formatPlayerName(player, roleNames)).toBe('Alice (Mayor)');
    });

    it('should handle missing role name mapping', () => {
      const player = createPlayer(1, 'Alice');
      player.role = 'unknown';
      const roleNames = { mayor: 'Mayor' };

      expect(formatPlayerName(player, roleNames)).toBe('Alice');
    });

    it('should handle null role', () => {
      const player = createPlayer(1, 'Alice');
      player.role = null;
      const roleNames = { mayor: 'Mayor' };

      expect(formatPlayerName(player, roleNames)).toBe('Alice');
    });
  });
});
