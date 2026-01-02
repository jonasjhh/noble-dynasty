// Game Types for Noble Dynasty

export interface Role {
  name: string;
  description: string;
}

export interface Location {
  name: string;
  description: string;
  closed: boolean;
}

export interface Policy {
  name: string;
  description: string;
}

export interface GoodsType {
  name: string;
  value: number;
  description: string;
}

export interface Building {
  name: string;
  cost: number;
  description: string;
}

export interface StartingChoice {
  name: string;
  description: string;
  rewards: {
    gold: number;
    political_influence: number;
    buildings?: string[];
    henchman_cards?: number;
  };
}

export interface Player {
  id: number;
  name: string;
  gold: number;
  goods: Record<string, number>;
  political_influence: number;
  servants_available: number;
  servants_total: number;
  victory_points: number;
  role: string | null;
  buildings: string[];
  henchman_cards: string[];
  news_cards: string[];
  extra_servants: number;
}

export type GameState =
  | 'setup'
  | 'starting_choices'
  | 'election'
  | 'role_selection'
  | 'policy_selection'
  | 'action_placement'
  | 'finished';

export type GamePhase = 'setup' | 'playing' | 'finished';
