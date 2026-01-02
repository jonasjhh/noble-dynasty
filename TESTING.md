# Testing Guide

This project includes comprehensive tests using Vitest and React Testing Library.

## Test Structure

```
src/tests/
├── setup.ts           # Test configuration and global setup
├── data.test.ts       # Tests for game data (roles, locations, policies)
├── App.test.tsx       # Tests for the App component
└── utils.test.ts      # Tests for utility functions
```

## Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run mutation testing
pnpm test:mutation
```

## Test Coverage

The project has an 80% coverage threshold for:
- Lines
- Functions
- Branches
- Statements

## Test Suites

### 1. Game Data Tests (`data.test.ts`)

Tests for all game data constants:

**ROLES** (7 tests)
- ✓ Validates all 7 roles exist (mayor, prospector, producer, architect, thieves_guildmaster, merchant, recruiter)
- ✓ Ensures each role has name and description

**LOCATIONS** (7 tests)
- ✓ Validates all 7 locations exist
- ✓ Ensures proper data structure
- ✓ Verifies all locations start open (closed: false)

**POLICIES** (8 tests)
- ✓ Validates all 8 policies exist
- ✓ Ensures proper data structure

**GOODS_TYPES** (5 tests)
- ✓ Validates all 5 goods types
- ✓ Verifies values are ordered (1-5)
- ✓ Ensures proper data structure

**BUILDINGS** (8 tests)
- ✓ Validates all 8 buildings exist
- ✓ Verifies costs are reasonable (6-12 gold)
- ✓ Ensures proper data structure

**STARTING_CHOICES** (6 tests)
- ✓ Validates exactly 6 choices exist
- ✓ Ensures proper data structure
- ✓ Verifies balanced rewards
- ✓ Checks for unique names

### 2. App Component Tests (`App.test.tsx`)

Tests for the main React component:

- ✓ Renders without crashing
- ✓ Displays game title "Noble Dynasty"
- ✓ Displays game tagline
- ✓ Shows framework initialization message
- ✓ Has link to legacy version
- ✓ Applies correct CSS classes

### 3. Utility Function Tests (`utils.test.ts`)

Tests for game utility functions:

**createPlayer()**
- ✓ Creates player with correct default values
- ✓ Creates unique players with different IDs

**calculatePlayerWealth()**
- ✓ Calculates wealth with only gold
- ✓ Calculates wealth with gold and goods
- ✓ Handles all goods types correctly
- ✓ Handles empty goods

**getAvailableServants()**
- ✓ Returns available servants
- ✓ Includes extra servants from roles
- ✓ Handles zero servants

**canAffordBuilding()**
- ✓ Returns true when player has enough gold
- ✓ Returns false when player lacks gold
- ✓ Applies architect discount (3 gold)
- ✓ Handles exact cost matching
- ✓ Prevents negative costs

**applyStartingChoice()**
- ✓ Applies basic rewards (gold, influence)
- ✓ Adds buildings to player
- ✓ Adds henchman cards
- ✓ Does not mutate original player (immutability)

**formatPlayerName()**
- ✓ Returns player name without role
- ✓ Formats name with role
- ✓ Handles missing role mappings
- ✓ Handles null roles

## Total Test Count

- **Data Tests**: ~50 tests
- **Component Tests**: 6 tests
- **Utility Tests**: 24 tests
- **Total**: ~80 tests

## Test Configuration

The test setup includes:

- **Vitest**: Fast unit test framework
- **jsdom**: Browser environment simulation
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Additional matchers
- **Coverage**: V8 provider with HTML reports

## Running Specific Tests

```bash
# Run only data tests
pnpm test data.test

# Run only component tests
pnpm test App.test

# Run only utility tests
pnpm test utils.test

# Run tests matching a pattern
pnpm test --grep "player"
```

## Coverage Reports

After running `pnpm test:coverage`, view the HTML report:

```bash
open coverage/index.html
```

The coverage report shows:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage
- Uncovered lines highlighted

## CI/CD Integration

Tests run automatically on every push via GitHub Actions:

1. Install dependencies
2. Run linter
3. Run type checker
4. Run all tests
5. Build passes only if all tests pass

## Writing New Tests

When adding new features, follow these patterns:

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

For component tests:

```typescript
import { render, screen } from '@testing-library/react';

it('should render component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

## Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Keep tests isolated** (no shared state)
4. **Aim for high coverage** (>80%)
5. **Test edge cases** and error conditions
6. **Mock external dependencies** when needed
7. **Use TypeScript** for type safety in tests
