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

- **Card.test.ts** - Tests for Card, NumberCard, and OperatorCard classes (includes mocked implementations)
- **problemSolver.test.ts** - Tests for mathematical problem-solving logic (includes mocked implementations)

Note: These test files include mocked implementations of the original classes/functions since the source files were removed during refactoring. The tests ensure the expected behavior is maintained.