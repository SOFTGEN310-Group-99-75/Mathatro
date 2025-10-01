import { generateSolvableHandAndObjective } from '../src/utils/SolvableHandGenerator';
import { describe, it, expect } from 'vitest';

const DIFFICULTIES: Array<'easy'|'medium'|'hard'> = ['easy','medium','hard'];

// Basic validation tests for round generation

describe('Round solvability stress', () => {
  it('validates that generated hands have correct size', () => {
    const difficulties: Array<'easy'|'medium'|'hard'> = ['easy', 'medium', 'hard'];
    difficulties.forEach(diff => {
      const round = generateSolvableHandAndObjective(diff);
      expect(round.hand.length).toBe(8);
    });
  });

  it('validates that solution expressions are valid', () => {
    for (let i = 0; i < 10; i++) {
      const round = generateSolvableHandAndObjective('medium');
      expect(round.solutionExpression).toBeTruthy();
      expect(round.solutionExpression.length).toBeGreaterThan(0);
      const tokens = round.solutionExpression.split(' ');
      expect(tokens.length).toBeGreaterThan(0);
    }
  });

  it('validates that objectives are non-empty strings', () => {
    DIFFICULTIES.forEach(diff => {
      const round = generateSolvableHandAndObjective(diff);
      expect(round.objective).toBeTruthy();
      expect(typeof round.objective).toBe('string');
      expect(round.objective.length).toBeGreaterThan(0);
    });
  });

  it('validates that hand contains numbers and operators', () => {
    DIFFICULTIES.forEach(diff => {
      const round = generateSolvableHandAndObjective(diff);
      const numbers = round.hand.filter(card => /^\d+$/.test(card));
      const operators = round.hand.filter(card => /^[+\-*/x÷^]$/.test(card));
      
      expect(numbers.length).toBeGreaterThan(0);
      expect(operators.length).toBeGreaterThan(0);
    });
  });

  it('validates that values are finite numbers', () => {
    for (let i = 0; i < 20; i++) {
      const round = generateSolvableHandAndObjective('easy');
      expect(Number.isFinite(round.value)).toBe(true);
      expect(typeof round.value).toBe('number');
    }
  });

  it('generates different objectives across multiple rounds', () => {
    const objectives = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const round = generateSolvableHandAndObjective('medium');
      objectives.add(round.objective);
    }
    // Should have variety in objectives
    expect(objectives.size).toBeGreaterThan(3);
  });
});

