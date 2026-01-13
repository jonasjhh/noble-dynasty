-- Noble Dynasty Initial Schema Migration
-- This creates the core tables for multiplayer game state management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games table: stores game instances
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (
    status IN ('lobby', 'starting_choices', 'election', 'role_selection', 'policy_selection', 'action_placement', 'finished')
  ),
  current_round INTEGER NOT NULL DEFAULT 1,
  max_rounds INTEGER NOT NULL DEFAULT 12,
  mayor_player_id UUID,
  current_player_id UUID,
  current_policy TEXT,
  min_players INTEGER NOT NULL DEFAULT 3,
  max_players INTEGER NOT NULL DEFAULT 4,
  game_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_slots JSONB NOT NULL DEFAULT '{}'::jsonb,
  voting_results JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Players table: stores player state within games
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_order INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 5,
  political_influence INTEGER NOT NULL DEFAULT 1,
  servants_available INTEGER NOT NULL DEFAULT 2,
  servants_total INTEGER NOT NULL DEFAULT 2,
  victory_points INTEGER NOT NULL DEFAULT 0,
  role TEXT,
  goods JSONB NOT NULL DEFAULT '{}'::jsonb,
  buildings JSONB NOT NULL DEFAULT '[]'::jsonb,
  henchman_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  news_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  extra_servants INTEGER NOT NULL DEFAULT 0,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(game_id, player_order)
);

-- Create indexes for performance
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_player_order ON players(game_id, player_order);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for now (you can restrict later)
CREATE POLICY "Allow all operations on games"
  ON games
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on players"
  ON players
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to get player count for a game
CREATE OR REPLACE FUNCTION get_player_count(game_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM players WHERE game_id = game_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to check if game can start
CREATE OR REPLACE FUNCTION can_start_game(game_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  game_record RECORD;
  player_count INTEGER;
BEGIN
  SELECT * INTO game_record FROM games WHERE id = game_uuid;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF game_record.status != 'lobby' THEN
    RETURN false;
  END IF;

  player_count := get_player_count(game_uuid);

  RETURN player_count >= game_record.min_players
    AND player_count <= game_record.max_players;
END;
$$ LANGUAGE plpgsql STABLE;
