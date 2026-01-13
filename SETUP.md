# Noble Dynasty - Multiplayer Setup Guide

This guide will help you set up and deploy the multiplayer version of Noble Dynasty using Supabase for state management and real-time synchronization.

## Prerequisites

- Node.js 20 or higher
- pnpm 10 or higher
- A Supabase account (free tier works great)

## Step 1: Clone and Install

```bash
cd noble-dynasty
pnpm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: noble-dynasty (or your choice)
   - **Database Password**: Generate a secure password
   - **Region**: Choose closest to your players
5. Click "Create new project"
6. Wait for the project to be provisioned (~2 minutes)

### Get Your Supabase Credentials

1. In your Supabase project dashboard, click "Settings" (gear icon)
2. Click "API" in the left sidebar
3. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### Configure Environment Variables

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Run Database Migrations

You have two options for running migrations:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL editor
6. Click "Run" or press Ctrl+Enter
7. Verify success (you should see "Success. No rows returned")

### Option B: Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref your-project-ref
```

3. Push migrations:
```bash
supabase db push
```

### Verify Migrations

After running migrations, verify in Supabase Dashboard:

1. Click "Table Editor" in the left sidebar
2. You should see two tables:
   - `games` - Stores game state
   - `players` - Stores player state

## Step 4: Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Step 5: Test Multiplayer

To test multiplayer functionality:

1. Open the game in your browser
2. Click "Create New Game"
3. Enter your name when prompted
4. Copy the Game ID from the lobby screen
5. Open a new browser window (or incognito window)
6. Click "Join Existing Game"
7. Paste the Game ID and enter a different name
8. The host can start the game once 3-4 players have joined

## How It Works

### Game Flow

1. **Menu Screen**: Create or join a game
2. **Lobby**: Players join and wait for host to start
3. **Starting Choices**: Each player selects their background
4. **Mayor Election**: Players vote for the mayor
5. **Role Selection**: Players choose roles (counter-clockwise from mayor)
6. **Policy Selection**: Mayor chooses a policy
7. **Action Placement**: Players place servants on locations
8. **Repeat**: Steps 4-7 for 12 rounds
9. **Game Over**: Winner revealed

### Real-Time Synchronization

The game uses Supabase Real-time to synchronize game state across all players:

- When any player makes a move, the database updates
- All connected clients receive the update automatically
- No polling or manual refresh needed

### Database Schema

#### `games` Table
- Stores overall game state
- Tracks current round, phase, mayor, policy
- Holds action slots and voting results as JSON

#### `players` Table
- Stores individual player state
- Links to parent game via `game_id`
- Tracks resources, buildings, cards, etc.

## Deployment to GitHub Pages

### Update Base Path

The `vite.config.ts` already has the correct base path for GitHub Pages:

```typescript
base: '/noble-dynasty/'
```

### Enable GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Set Source to "GitHub Actions"
4. Push to `main` branch

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
- Install dependencies
- Run linter
- Run type checking
- Run tests
- Build the project
- Deploy to GitHub Pages

### Access Your Deployed Game

After deployment, your game will be available at:
```
https://your-username.github.io/noble-dynasty/
```

## Environment Variables in Production

For GitHub Pages deployment, you need to add environment variables as repository secrets:

1. Go to your repository on GitHub
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add:
   - Name: `VITE_SUPABASE_URL`
   - Value: Your Supabase project URL
5. Add another secret:
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon key

Then update `.github/workflows/deploy.yml` to use these secrets during build:

```yaml
- name: Build
  run: pnpm run build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

## Troubleshooting

### "Missing Supabase environment variables"

- Make sure `.env` file exists in project root
- Verify the variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after creating/editing `.env`

### "Failed to create game" or "Failed to join game"

- Verify migrations ran successfully
- Check Supabase project is running (not paused)
- Verify your API key is correct
- Check browser console for detailed errors

### Tables don't exist in Supabase

- Run the migration SQL manually via Supabase Dashboard
- The migration file is at `supabase/migrations/001_initial_schema.sql`

### Real-time updates not working

- Verify Supabase Real-time is enabled (it's on by default)
- Check browser console for connection errors
- Try refreshing the page

### "Row Level Security" errors

The migration includes RLS policies that allow all operations. If you encounter RLS errors:

1. Go to Supabase Dashboard → Authentication → Policies
2. Verify policies exist for `games` and `players` tables
3. Policies should allow all operations for now

## Security Considerations

### Current Setup (Development)

The current RLS policies allow **all operations** without authentication:

```sql
CREATE POLICY "Allow all operations on games"
  ON games FOR ALL USING (true) WITH CHECK (true);
```

This is fine for:
- Development
- Testing
- Private games among friends
- Low-stakes gameplay

### Production Recommendations

For production deployment, consider:

1. **Implement Authentication**
   - Use Supabase Auth
   - Link players to user accounts
   - Restrict operations to authenticated users

2. **Restrict RLS Policies**
   - Players can only modify their own data
   - Only game creator can start game
   - Validate game state transitions

3. **Add Rate Limiting**
   - Prevent spam game creation
   - Limit rapid database updates

4. **Secure Admin Operations**
   - Use Supabase functions for game logic
   - Validate moves server-side
   - Prevent cheating via client manipulation

Example production RLS policy:

```sql
-- Only allow reading games
CREATE POLICY "Anyone can read games"
  ON games FOR SELECT USING (true);

-- Only allow players in game to update
CREATE POLICY "Players can update their game"
  ON games FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.game_id = games.id
      AND players.id = auth.uid()
    )
  );
```

## Next Steps

- Read [RULES.md](RULES.md) to understand the game mechanics
- Check out [README.md](README.md) for development information
- Explore the codebase in `src/`

## Support

If you encounter issues:

1. Check this setup guide again
2. Review error messages in browser console
3. Check Supabase dashboard for errors
4. Open an issue on GitHub with details

Happy gaming! 🎮
