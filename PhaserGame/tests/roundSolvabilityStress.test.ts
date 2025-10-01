import { generateSolvableHandAndObjective } from '../src/utils/SolvableHandGenerator';
import { isObjectiveSolvable } from '../src/utils/ExpressionSolver';
import { describe, it, expect } from 'vitest';

const DIFFICULTIES: Array<'easy'|'medium'|'hard'> = ['easy','medium','hard'];

// Stress test to catch any regression causing unsolvable rounds

describe('Round solvability stress', () => {
  DIFFICULTIES.forEach(diff => {
    it(`generates solvable rounds for difficulty ${diff}`, () => {
      for (let i=0;i<150;i++) { // 150 per difficulty
        const round = generateSolvableHandAndObjective(diff);
        const check = isObjectiveSolvable(round.hand, round.objective, { maxNumbers: 6 });
        if (!check.solvable) {
          throw new Error(`Unsolvable round detected @${diff} attempt ${i}: hand=${round.hand.join(',')} objective='${round.objective}' expr='${round.solutionExpression}' value=${round.value}`);
        }
      }
      expect(true).toBe(true);
    });
  });
});
