import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { Player as LocalPlayer } from '../types';

type Game = Database['public']['Tables']['games']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type GameInsert = Database['public']['Tables']['games']['Insert'];
type PlayerInsert = Database['public']['Tables']['players']['Insert'];

export interface GameWithPlayers extends Game {
  players: Player[];
}

/**
 * Create a new game in the lobby state
 */
export async function createGame(
  minPlayers = 3,
  maxPlayers = 4
): Promise<Game> {
  const { data, error } = await supabase
    .from('games')
    .insert({
      status: 'lobby',
      min_players: minPlayers,
      max_players: maxPlayers,
      current_round: 1,
      max_rounds: 12,
      game_log: [],
      action_slots: {},
      voting_results: {},
    } as GameInsert)
    .select()
    .single();

  if (error) throw new Error(`Failed to create game: ${error.message}`);
  if (!data) throw new Error('No data returned from game creation');

  return data;
}

/**
 * Join an existing game as a player
 */
export async function joinGame(
  gameId: string,
  playerName: string
): Promise<Player> {
  // First, get the game and check player count
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*, players(*)')
    .eq('id', gameId)
    .single();

  if (gameError) throw new Error(`Game not found: ${gameError.message}`);
  if (!game) throw new Error('Game not found');

  const players = (game.players as Player[]) || [];

  if (players.length >= game.max_players) {
    throw new Error('Game is full');
  }

  if (game.status !== 'lobby') {
    throw new Error('Game has already started');
  }

  // Determine player order
  const playerOrder = players.length;

  const { data, error } = await supabase
    .from('players')
    .insert({
      game_id: gameId,
      player_name: playerName,
      player_order: playerOrder,
      gold: 5,
      political_influence: 1,
      servants_available: 2,
      servants_total: 2,
      victory_points: 0,
      goods: {},
      buildings: [],
      henchman_cards: [],
      news_cards: [],
      extra_servants: 0,
      is_ready: false,
    } as PlayerInsert)
    .select()
    .single();

  if (error) throw new Error(`Failed to join game: ${error.message}`);
  if (!data) throw new Error('No data returned from player creation');

  return data;
}

/**
 * Get game with all players
 */
export async function getGame(gameId: string): Promise<GameWithPlayers | null> {
  const { data, error } = await supabase
    .from('games')
    .select(
      `
      *,
      players (*)
    `
    )
    .eq('id', gameId)
    .single();

  if (error) {
    console.error('Error fetching game:', error);
    return null;
  }

  return data as GameWithPlayers;
}

/**
 * Get all players in a game
 */
export async function getPlayers(gameId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .order('player_order', { ascending: true });

  if (error) throw new Error(`Failed to fetch players: ${error.message}`);

  return data || [];
}

/**
 * Start the game (move from lobby to starting_choices)
 */
export async function startGame(gameId: string): Promise<void> {
  const game = await getGame(gameId);

  if (!game) throw new Error('Game not found');

  const playerCount = game.players.length;

  if (playerCount < game.min_players) {
    throw new Error(`Need at least ${game.min_players} players to start`);
  }

  if (playerCount > game.max_players) {
    throw new Error(`Too many players (max ${game.max_players})`);
  }

  // Initialize action slots based on player count
  const slotsPerLocation = playerCount === 3 ? 2 : 3;
  const locations = [
    'city_hall',
    'thieves_guild',
    'marketplace',
    'recruitment_office',
    'printing_press',
    'production_hall',
    'construction_yard',
  ];

  const actionSlots: Record<string, (number | null)[]> = {};
  locations.forEach((loc) => {
    actionSlots[loc] = Array(slotsPerLocation).fill(null);
  });

  const { error } = await supabase
    .from('games')
    .update({
      status: 'starting_choices',
      action_slots: actionSlots,
      current_player_id: game.players[0]?.id || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq('id', gameId);

  if (error) throw new Error(`Failed to start game: ${error.message}`);
}

/**
 * Update game state
 */
export async function updateGame(
  gameId: string,
  updates: Partial<Game>
): Promise<void> {
  const { error } = await supabase
    .from('games')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updates as any)
    .eq('id', gameId);

  if (error) throw new Error(`Failed to update game: ${error.message}`);
}

/**
 * Update player state
 */
export async function updatePlayer(
  playerId: string,
  updates: Partial<Player>
): Promise<void> {
  const { error } = await supabase
    .from('players')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updates as any)
    .eq('id', playerId);

  if (error) throw new Error(`Failed to update player: ${error.message}`);
}

/**
 * Add log entry to game
 */
export async function addGameLog(
  gameId: string,
  message: string
): Promise<void> {
  const game = await getGame(gameId);
  if (!game) return;

  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;

  const gameLog = Array.isArray(game.game_log) ? game.game_log : [];
  const updatedLog = [...gameLog, logEntry];

  await updateGame(gameId, { game_log: updatedLog });
}

/**
 * Convert database player to local player format
 */
export function dbPlayerToLocal(player: Player): LocalPlayer {
  return {
    id: player.player_order + 1,
    name: player.player_name,
    gold: player.gold,
    goods: (player.goods as Record<string, number>) || {},
    political_influence: player.political_influence,
    servants_available: player.servants_available,
    servants_total: player.servants_total,
    victory_points: player.victory_points,
    role: player.role,
    buildings: (player.buildings as string[]) || [],
    henchman_cards: (player.henchman_cards as string[]) || [],
    news_cards: (player.news_cards as string[]) || [],
    extra_servants: player.extra_servants,
  };
}

/**
 * Subscribe to game updates
 */
export function subscribeToGame(
  gameId: string,
  callback: (game: GameWithPlayers) => void
) {
  const channel = supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      },
      async () => {
        const game = await getGame(gameId);
        if (game) callback(game);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `game_id=eq.${gameId}`,
      },
      async () => {
        const game = await getGame(gameId);
        if (game) callback(game);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
