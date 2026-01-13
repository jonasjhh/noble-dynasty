export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          status:
            | 'lobby'
            | 'starting_choices'
            | 'election'
            | 'role_selection'
            | 'policy_selection'
            | 'action_placement'
            | 'finished';
          current_round: number;
          max_rounds: number;
          mayor_player_id: string | null;
          current_player_id: string | null;
          current_policy: string | null;
          min_players: number;
          max_players: number;
          game_log: Json;
          action_slots: Json;
          voting_results: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?:
            | 'lobby'
            | 'starting_choices'
            | 'election'
            | 'role_selection'
            | 'policy_selection'
            | 'action_placement'
            | 'finished';
          current_round?: number;
          max_rounds?: number;
          mayor_player_id?: string | null;
          current_player_id?: string | null;
          current_policy?: string | null;
          min_players?: number;
          max_players?: number;
          game_log?: Json;
          action_slots?: Json;
          voting_results?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?:
            | 'lobby'
            | 'starting_choices'
            | 'election'
            | 'role_selection'
            | 'policy_selection'
            | 'action_placement'
            | 'finished';
          current_round?: number;
          max_rounds?: number;
          mayor_player_id?: string | null;
          current_player_id?: string | null;
          current_policy?: string | null;
          min_players?: number;
          max_players?: number;
          game_log?: Json;
          action_slots?: Json;
          voting_results?: Json;
        };
      };
      players: {
        Row: {
          id: string;
          game_id: string;
          player_name: string;
          player_order: number;
          gold: number;
          political_influence: number;
          servants_available: number;
          servants_total: number;
          victory_points: number;
          role: string | null;
          goods: Json;
          buildings: Json;
          henchman_cards: Json;
          news_cards: Json;
          extra_servants: number;
          is_ready: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_name: string;
          player_order?: number;
          gold?: number;
          political_influence?: number;
          servants_available?: number;
          servants_total?: number;
          victory_points?: number;
          role?: string | null;
          goods?: Json;
          buildings?: Json;
          henchman_cards?: Json;
          news_cards?: Json;
          extra_servants?: number;
          is_ready?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          player_name?: string;
          player_order?: number;
          gold?: number;
          political_influence?: number;
          servants_available?: number;
          servants_total?: number;
          victory_points?: number;
          role?: string | null;
          goods?: Json;
          buildings?: Json;
          henchman_cards?: Json;
          news_cards?: Json;
          extra_servants?: number;
          is_ready?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
