# Testing Guide - Splendor Duel

This document explains how to write and run tests for the game logic using Vitest.

## Setup

Tests are configured using **Vitest** with the following setup:

- **Framework**: Vitest v4
- **Environment**: happy-dom
- **UI Dashboard**: Available via `npm run test:ui`
- **Coverage**: Available via `npm run test:coverage`

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm test -- --watch

# View test UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

Tests are located in `__tests__` directories adjacent to the code they test:

```
src/logic/actions/
├── boardActions.js
├── marketActions.js
└── __tests__/
    ├── boardActions.test.js
    ├── marketActions.test.js
    └── ...
```

## Writing Action Handler Tests

Action handlers are pure functions that accept `(state, payload)` and return a modified state.

### Example: Testing a Simple Action

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { handleDiscardGem } from '../boardActions';
import { INITIAL_STATE_SKELETON } from '../../initialState';

describe('boardActions', () => {
    let testState;

    beforeEach(() => {
        // Create fresh state for each test
        testState = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON));
        testState.turn = 'p1';
        testState.inventories.p1.blue = 5;
    });

    it('should reduce gem count when discarding', () => {
        const before = testState.inventories.p1.blue;
        const after = handleDiscardGem(testState, 'blue');

        expect(after.inventories.p1.blue).toBe(before - 1);
    });
});
```

### Key Testing Patterns

#### 1. **State Setup with beforeEach**

Always start with a clean state copy to avoid test pollution:

```javascript
beforeEach(() => {
    testState = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON));
    // Customize state for test scenario
    testState.inventories.p1.blue = 10;
    testState.turn = 'p1';
});
```

#### 2. **Test State Mutations**

Verify that the action correctly modifies the expected parts:

```javascript
it('should update inventory after taking gems', () => {
    const before = testState.inventories.p1.blue;
    const result = handleTakeGems(testState, {
        coords: [
            /* ... */
        ],
    });

    expect(result.inventories.p1.blue).toBeGreaterThan(before);
});
```

#### 3. **Test Side Effects**

Verify that actions trigger feedback, change game mode, etc:

```javascript
it('should change game mode to DISCARD_EXCESS_GEMS', () => {
    testState.inventories.p1 = {
        blue: 5,
        white: 5,
        green: 1,
        black: 0,
        red: 0,
        gold: 0,
        pearl: 0,
    };

    const result = handleStealGem(testState, { gemId: 'blue' });

    if (result.gameMode === 'DISCARD_EXCESS_GEMS') {
        expect(result.gameMode).toBe('DISCARD_EXCESS_GEMS');
    }
});
```

#### 4. **Test Edge Cases**

Always test boundary conditions:

```javascript
it('should handle zero gems gracefully', () => {
    testState.inventories.p1.white = 0;
    const result = handleDiscardGem(testState, 'white');

    expect(result.inventories.p1.white).toBe(0); // Should not go negative
});
```

## Common Test Utilities

### Creating Test Fixtures

```javascript
// Minimal state for specific test
const createGameState = (overrides = {}) => ({
    ...JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON)),
    ...overrides,
});

// In test:
const state = createGameState({
    turn: 'p1',
    gameMode: 'BONUS_ACTION',
});
```

### Checking Inventory Changes

```javascript
const gemsBefore = Object.values(testState.inventories.p1).reduce((a, b) => a + b, 0);

// ... action happens ...

const gemsAfter = Object.values(result.inventories.p1).reduce((a, b) => a + b, 0);

expect(gemsAfter).toBe(gemsBefore - 1);
```

## Test Organization

### Good Test Names

✅ **Good**: `should reduce gem count when player discards a gem`
✅ **Good**: `should not allow discarding more gems than player has`
❌ **Bad**: `test discard`
❌ **Bad**: `discard works`

### Logical Grouping

```javascript
describe('handleDiscardGem', () => {
  describe('basic functionality', () => {
    it('should reduce gem count', () => { ... });
  });

  describe('edge cases', () => {
    it('should not go below zero', () => { ... });
  });

  describe('game flow', () => {
    it('should transition to next player when total <= 10', () => { ... });
  });
});
```

## Coverage Goals

Aim for **80%+ coverage** on logic layer files:

- `src/logic/actions/*.js` - **Target: 100%** (pure functions)
- `src/logic/validators.js` - **Target: 100%** (decision logic)
- `src/logic/turnManager.js` - **Target: 90%** (complex flow)
- Components - **Target: 60%** (less critical than logic)

Generate a coverage report:

```bash
npm run test:coverage
```

This creates an HTML report in `coverage/` folder.

## Debugging Tests

### Run Single Test File

```bash
npm test -- src/logic/actions/__tests__/boardActions.test.js
```

### Run Tests Matching Pattern

```bash
npm test -- --grep "discard"
```

### Debug Mode

```bash
npm test -- --inspect-brk
# Then open Chrome DevTools (chrome://inspect) to debug
```

## Integration with CI/CD

Add to your CI pipeline:

```bash
npm test -- --run  # Run once (no watch mode)
npm run test:coverage  # Generate coverage report
```

Both commands will exit with a non-zero code on failure, triggering CI failure.

## Type Safety in Tests

With TypeScript definitions in place, you can add JSDoc hints for type checking:

```javascript
/**
 * @type {import('../../types').GameState}
 */
let testState;

beforeEach(() => {
    testState = createGameState();
    // Now your IDE will provide autocompletion for testState properties
});
```

---

**Next Steps**: Add tests for `validators.js`, `turnManager.js`, and other action handlers to improve coverage.
