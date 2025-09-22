# Test Suite Documentation

This directory contains comprehensive test files for the Phaser Card Math Game using Vitest testing framework.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (default)
npm test

# Run specific test file
npm test Card.test.ts

# Run tests matching a pattern
npm test -- problemSolver
```

## Current Test Files

- **Card.test.ts** - Tests for CardUtils class methods (card creation, management, and styling)
- **problemSolver.test.ts** - Tests for GenerateObjective functions and GameStateManager class

## Current Codebase Structure

The codebase has been refactored and now includes:
- **UIHelpers.ts** - Utility functions for creating styled UI components
- **CardUtils.ts** - Utility functions for card creation and management
- **GameConstants.ts** - Centralized configuration constants
- **GameManager.ts** - Singleton for game coordination
- **GameStateManager.ts** - Game state and logic management
- **LayoutManager.ts** - UI layout calculations
- **GenerateObjective.ts** - Mathematical objective generation logic

## Test Coverage

The tests now cover the actual functionality in the codebase:

### Card.test.ts
- Tests `CardUtils.createStandardCard()` - card creation with proper styling
- Tests `CardUtils.createPlaceholderCard()` - placeholder card creation
- Tests `CardUtils.setCardAsPlaceholder()` and `setCardWithContent()` - card appearance updates
- Tests `CardUtils.createCardsFromArray()` - bulk card creation
- Tests `CardUtils.updateCardsInSlots()` - slot management

### problemSolver.test.ts
- Tests `GenerateObjective()` - mathematical objective generation (comparison, factor, divisible, power, prime, etc.)
- Tests `generateNonPrime()` - non-prime number generation
- Tests `GameStateManager` - game state management, score tracking, lives management, objective handling, game flow control

Note: These tests now cover the actual refactored functionality instead of mocked implementations, ensuring the real game logic works correctly.