-- Enable Realtime replication for games and players tables
-- This allows real-time subscriptions to table changes

ALTER publication supabase_realtime ADD TABLE games;
ALTER publication supabase_realtime ADD TABLE players;
