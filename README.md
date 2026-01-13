# Noble Dynasty

Command houses. Manipulate the court. Deceive your rivals. Rule the city. Forge your dynasty.

**A multiplayer strategic worker placement game** where players compete to build influence, wealth, and power in a medieval city over 12 rounds.

## Features

- 🎮 **Multiplayer**: Real-time online gameplay for 3-4 players
- 🔄 **Real-Time Sync**: All players see updates instantly via Supabase
- 🎲 **Strategic Gameplay**: Mayor elections, role selection, policy making, and worker placement
- 🏰 **Medieval Theme**: Beautiful medieval UI with gradients and themed styling
- 📱 **Responsive**: Works on desktop and mobile devices
- ⚡ **Fast**: Built with Vite for instant hot module replacement

## Quick Start

### For Players

1. Visit the deployed game (or host it yourself)
2. Click "Create New Game" to host
3. Share the Game ID with friends
4. Friends click "Join Existing Game" and enter the Game ID
5. Host starts the game when 3-4 players have joined

### For Developers

See [SETUP.md](SETUP.md) for complete setup instructions including Supabase configuration.

**Quick setup**:
```bash
# Install dependencies
pnpm install

# Configure environment (copy .env.example to .env and add your Supabase credentials)
cp .env.example .env

# Run database migrations via Supabase Dashboard

# Start development server
pnpm dev
```

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript 5.7** - Type safety and developer experience
- **Vite 6** - Fast build tool and dev server
- **CSS3** - Custom medieval-themed styling

### Backend
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security** - Database-level access control
- **Real-time** - WebSocket-based state synchronization

### Development Tools
- **Vitest** - Fast unit testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **pnpm** - Fast, efficient package manager
- **GitHub Actions** - CI/CD pipeline

## Project Structure

```
noble-dynasty/
├── .github/workflows/     # CI/CD pipeline
├── src/
│   ├── components/        # React components
│   │   ├── LobbyPanel.tsx       # Main menu for creating/joining games
│   │   ├── GameLobby.tsx        # Game lobby before start
│   │   ├── SetupPanel.tsx       # Original setup panel (unused)
│   │   ├── StartingChoicesModal.tsx
│   │   ├── MayorElectionModal.tsx
│   │   ├── RoleSelectionModal.tsx
│   │   ├── PolicySelectionModal.tsx
│   │   ├── PlayerInfo.tsx       # Player resource displays
│   │   └── GameBoard.tsx        # City locations board
│   ├── services/          # API services
│   │   └── gameService.ts       # Supabase game operations
│   ├── lib/               # Libraries
│   │   └── supabase.ts          # Supabase client
│   ├── types/             # TypeScript types
│   │   ├── index.ts             # Game types
│   │   └── database.ts          # Supabase database types
│   ├── utils/             # Utility functions
│   ├── data.ts            # Game data (roles, locations, policies)
│   ├── GameEngine.ts      # Legacy game engine (for reference)
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styles
├── supabase/
│   └── migrations/        # Database migrations
│       └── 001_initial_schema.sql
├── scripts/
│   └── migrate.js         # Migration runner
├── legacy/                # Original vanilla JS implementation
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite bundler configuration
├── vitest.config.ts       # Test configuration
├── SETUP.md               # Detailed setup instructions
├── RULES.md               # Game rules documentation
└── index.html             # HTML entry point
```

## Available Scripts

- `pnpm dev` - Start development server (port 5173)
- `pnpm build` - TypeScript compile + production build
- `pnpm preview` - Preview production build locally
- `pnpm test` - Run all tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm lint` - Lint TypeScript files
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm clean` - Remove build artifacts
- `pnpm db:migrate` - Run database migrations (see SETUP.md for preferred method)

## Game Overview

Noble Dynasty is a strategic worker placement game where players:

1. **Select Starting Advantages** - Choose your house's background
2. **Elect a Mayor** - Vote using political influence
3. **Choose Roles** - Select roles that grant special abilities
4. **Enact Policies** - Mayor chooses a policy affecting all players
5. **Place Servants** - Send workers to city locations for resources and actions
6. **Repeat** - Play through 12 rounds
7. **Win** - Player with the most Victory Points wins

For complete rules, see [RULES.md](RULES.md).

## Architecture

### Multiplayer Design

The game uses a **centralized state** architecture with Supabase:

1. **Database as Source of Truth**: All game state lives in PostgreSQL
2. **Real-Time Synchronization**: Supabase Real-time pushes updates to all clients
3. **Optimistic Updates**: UI updates immediately, then syncs with database
4. **Turn-Based**: Only the current player can make moves

### Database Schema

- **`games` table**: Stores game instance state (round, phase, mayor, policy, etc.)
- **`players` table**: Stores individual player state (resources, buildings, cards)
- **Foreign Keys**: Players link to their game via `game_id`
- **JSONB Columns**: Complex data like action slots and voting results

### Real-Time Flow

```
Player Action → Update Database → Database Trigger →
Real-time Notification → All Clients Receive Update → UI Refreshes
```

## Development Workflow

1. **Code Quality**: ESLint ensures best practices
2. **Type Safety**: TypeScript strict mode catches errors
3. **Testing**: Vitest with 80% coverage thresholds
4. **Formatting**: Prettier maintains consistent style
5. **CI/CD**: GitHub Actions runs all checks and deploys

## Deployment

The project automatically deploys to GitHub Pages on every push to `main`.

**Deployment URL**: `https://[username].github.io/noble-dynasty/`

### GitHub Pages Setup

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Add Supabase credentials as repository secrets
4. Push to main branch - deployment happens automatically

See [SETUP.md](SETUP.md) for detailed deployment instructions.

## Environment Variables

Required environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

## Security

The current implementation uses permissive RLS policies for development. For production deployment, consider:

- Implementing Supabase Authentication
- Restricting RLS policies to authenticated users
- Adding server-side validation
- Rate limiting game creation
- Validating moves server-side

See [SETUP.md](SETUP.md) Security Considerations section for details.

## Legacy Version

The original vanilla JavaScript implementation is preserved in the `legacy/` folder for reference.

## Documentation

- [SETUP.md](SETUP.md) - Complete setup and deployment guide
- [RULES.md](RULES.md) - Full game rules and mechanics
- [TESTING.md](TESTING.md) - Testing documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `pnpm test && pnpm lint && pnpm typecheck`
5. Submit a pull request

## Roadmap

Potential future enhancements:

- [ ] Full implementation of all location actions
- [ ] Henchman and News card mechanics
- [ ] Assassination resolution system
- [ ] Player-to-player trading
- [ ] VP banking and hidden VP system
- [ ] AI opponents for single-player
- [ ] Game replays and statistics
- [ ] User authentication and profiles
- [ ] Matchmaking system
- [ ] Custom game rules and variants

## License

[Add your license here]

## Credits

Framework inspired by the melee project structure.
Game design and implementation by the Noble Dynasty team.
