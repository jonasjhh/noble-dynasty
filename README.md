# Noble Dynasty

Command houses. Manipulate the court. Deceive your rivals. Rule the city. Forge your dynasty.

## Framework Overview

This project uses a modern TypeScript + React framework inspired by the melee project structure:

- **React 19** for UI
- **TypeScript 5.7** for type safety
- **Vite 6** for fast development and building
- **Vitest** for testing
- **pnpm** for package management
- **ESLint & Prettier** for code quality
- **GitHub Pages** for deployment

## Project Structure

```
noble-dynasty/
├── .github/workflows/   # CI/CD pipeline
├── src/
│   ├── components/      # React components
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── data.ts          # Game data (roles, locations, policies, etc.)
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # React DOM entry point
│   └── index.css        # Global styles
├── legacy/              # Original vanilla JS implementation
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite bundler configuration
├── vitest.config.ts     # Test configuration
└── index.html           # HTML entry point
```

## Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 10.0.0

## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start development server**:
   ```bash
   pnpm dev
   ```
   This will start the Vite dev server at http://localhost:5173

3. **Build for production**:
   ```bash
   pnpm build
   ```
   Output will be in `dist/frontend/`

## Available Scripts

- `pnpm dev` - Start development server (port 5173)
- `pnpm build` - TypeScript compile + production build
- `pnpm preview` - Preview production build locally
- `pnpm test` - Run all tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:mutation` - Run mutation testing (Stryker)
- `pnpm lint` - Lint TypeScript files
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm clean` - Remove build artifacts

## Deployment

The project automatically deploys to GitHub Pages on every push to the `main` branch via GitHub Actions.

**Deployment URL**: `https://[username].github.io/noble-dynasty/`

### GitHub Pages Setup

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to main branch - deployment happens automatically

## Development Workflow

1. **Code Quality**: ESLint ensures code follows best practices
2. **Type Safety**: TypeScript strict mode catches errors early
3. **Testing**: Vitest runs unit tests with coverage thresholds (80%)
4. **Formatting**: Prettier maintains consistent code style
5. **CI/CD**: GitHub Actions runs lint, typecheck, tests, and deploys

## Architecture Patterns

### Type-First Development

- Full TypeScript strict mode
- Centralized type definitions in `src/types/`
- Type safety across all components

### Game Data Separation

- All game data (roles, locations, policies) in `src/data.ts`
- Easy to modify and extend game content
- Type-safe data structures

### Component-Based UI

- React components for all UI elements
- Reusable and composable components
- State management with React hooks

## Legacy Version

The original vanilla JavaScript implementation is preserved in the `legacy/` folder and can be accessed at `/noble-dynasty/legacy/index.html` when deployed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `pnpm test && pnpm lint`
5. Submit a pull request

## License

[Add your license here]
