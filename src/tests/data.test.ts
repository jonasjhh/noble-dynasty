import { describe, it, expect } from 'vitest';
import {
  ROLES,
  LOCATIONS,
  POLICIES,
  GOODS_TYPES,
  BUILDINGS,
  STARTING_CHOICES,
} from '../data';

describe('Game Data', () => {
  describe('ROLES', () => {
    it('should have all expected roles', () => {
      const roleKeys = Object.keys(ROLES);
      expect(roleKeys).toContain('mayor');
      expect(roleKeys).toContain('prospector');
      expect(roleKeys).toContain('producer');
      expect(roleKeys).toContain('architect');
      expect(roleKeys).toContain('thieves_guildmaster');
      expect(roleKeys).toContain('merchant');
      expect(roleKeys).toContain('recruiter');
    });

    it('should have valid role data structure', () => {
      Object.values(ROLES).forEach((role) => {
        expect(role).toHaveProperty('name');
        expect(role).toHaveProperty('description');
        expect(typeof role.name).toBe('string');
        expect(typeof role.description).toBe('string');
        expect(role.name.length).toBeGreaterThan(0);
        expect(role.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('LOCATIONS', () => {
    it('should have all expected locations', () => {
      const locationKeys = Object.keys(LOCATIONS);
      expect(locationKeys).toContain('city_hall');
      expect(locationKeys).toContain('thieves_guild');
      expect(locationKeys).toContain('marketplace');
      expect(locationKeys).toContain('recruitment_office');
      expect(locationKeys).toContain('printing_press');
      expect(locationKeys).toContain('production_hall');
      expect(locationKeys).toContain('construction_yard');
    });

    it('should have valid location data structure', () => {
      Object.values(LOCATIONS).forEach((location) => {
        expect(location).toHaveProperty('name');
        expect(location).toHaveProperty('description');
        expect(location).toHaveProperty('closed');
        expect(typeof location.name).toBe('string');
        expect(typeof location.description).toBe('string');
        expect(typeof location.closed).toBe('boolean');
      });
    });

    it('should have all locations open by default', () => {
      Object.values(LOCATIONS).forEach((location) => {
        expect(location.closed).toBe(false);
      });
    });
  });

  describe('POLICIES', () => {
    it('should have all expected policies', () => {
      const policyKeys = Object.keys(POLICIES);
      expect(policyKeys).toContain('taxation');
      expect(policyKeys).toContain('corruption');
      expect(policyKeys).toContain('conscription');
      expect(policyKeys).toContain('subsidy');
      expect(policyKeys).toContain('martial_law');
      expect(policyKeys).toContain('censorship');
      expect(policyKeys).toContain('embargo');
      expect(policyKeys).toContain('hands_off');
    });

    it('should have valid policy data structure', () => {
      Object.values(POLICIES).forEach((policy) => {
        expect(policy).toHaveProperty('name');
        expect(policy).toHaveProperty('description');
        expect(typeof policy.name).toBe('string');
        expect(typeof policy.description).toBe('string');
      });
    });
  });

  describe('GOODS_TYPES', () => {
    it('should have all expected goods types', () => {
      const goodsKeys = Object.keys(GOODS_TYPES);
      expect(goodsKeys).toContain('grain');
      expect(goodsKeys).toContain('cloth');
      expect(goodsKeys).toContain('tools');
      expect(goodsKeys).toContain('jewelry');
      expect(goodsKeys).toContain('spices');
    });

    it('should have valid goods data structure', () => {
      Object.values(GOODS_TYPES).forEach((goods) => {
        expect(goods).toHaveProperty('name');
        expect(goods).toHaveProperty('value');
        expect(goods).toHaveProperty('description');
        expect(typeof goods.name).toBe('string');
        expect(typeof goods.value).toBe('number');
        expect(typeof goods.description).toBe('string');
        expect(goods.value).toBeGreaterThan(0);
      });
    });

    it('should have goods ordered by value', () => {
      const values = Object.values(GOODS_TYPES).map((g) => g.value);
      expect(values).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('BUILDINGS', () => {
    it('should have all expected buildings', () => {
      const buildingKeys = Object.keys(BUILDINGS);
      expect(buildingKeys).toContain('guardhouse');
      expect(buildingKeys).toContain('trade_depot');
      expect(buildingKeys).toContain('library');
      expect(buildingKeys).toContain('barracks');
      expect(buildingKeys).toContain('market_stalls');
      expect(buildingKeys).toContain('manufactory');
      expect(buildingKeys).toContain('town_square');
      expect(buildingKeys).toContain('spy_network');
    });

    it('should have valid building data structure', () => {
      Object.values(BUILDINGS).forEach((building) => {
        expect(building).toHaveProperty('name');
        expect(building).toHaveProperty('cost');
        expect(building).toHaveProperty('description');
        expect(typeof building.name).toBe('string');
        expect(typeof building.cost).toBe('number');
        expect(typeof building.description).toBe('string');
        expect(building.cost).toBeGreaterThan(0);
      });
    });

    it('should have reasonable building costs', () => {
      Object.values(BUILDINGS).forEach((building) => {
        expect(building.cost).toBeGreaterThanOrEqual(6);
        expect(building.cost).toBeLessThanOrEqual(12);
      });
    });
  });

  describe('STARTING_CHOICES', () => {
    it('should have exactly 6 starting choices', () => {
      expect(STARTING_CHOICES).toHaveLength(6);
    });

    it('should have valid starting choice data structure', () => {
      STARTING_CHOICES.forEach((choice) => {
        expect(choice).toHaveProperty('name');
        expect(choice).toHaveProperty('description');
        expect(choice).toHaveProperty('rewards');
        expect(typeof choice.name).toBe('string');
        expect(typeof choice.description).toBe('string');
        expect(choice.rewards).toHaveProperty('gold');
        expect(choice.rewards).toHaveProperty('political_influence');
        expect(typeof choice.rewards.gold).toBe('number');
        expect(typeof choice.rewards.political_influence).toBe('number');
      });
    });

    it('should have balanced starting rewards', () => {
      STARTING_CHOICES.forEach((choice) => {
        const totalValue =
          choice.rewards.gold +
          choice.rewards.political_influence * 2 +
          (choice.rewards.buildings?.length || 0) * 3 +
          (choice.rewards.henchman_cards || 0);

        // All choices should be roughly balanced (between 4 and 15 points)
        expect(totalValue).toBeGreaterThanOrEqual(4);
        expect(totalValue).toBeLessThanOrEqual(15);
      });
    });

    it('should have unique names', () => {
      const names = STARTING_CHOICES.map((c) => c.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(STARTING_CHOICES.length);
    });
  });
});
