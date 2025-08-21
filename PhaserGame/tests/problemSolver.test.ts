import { describe, it, expect, vi } from 'vitest';
import { solveProblem } from '../src/util/problemSolver';
import { NumberCard, OperatorCard } from '../src/Card';

describe('problemSolver', () => {
    describe('solveProblem', () => {
        it('should solve simple addition', () => {
            const cards = [
                new NumberCard(2),
                new OperatorCard('+'),
                new NumberCard(3)
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([5]);
        });

        it('should solve simple subtraction', () => {
            const cards = [
                new NumberCard(5),
                new OperatorCard('-'),
                new NumberCard(2)
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([3]);
        });

        it('should solve simple multiplication', () => {
            const cards = [
                new NumberCard(4),
                new OperatorCard('*'),
                new NumberCard(3)
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([12]);
        });

        it('should solve simple division', () => {
            const cards = [
                new NumberCard(8),
                new OperatorCard('/'),
                new NumberCard(2)
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([4]);
        });

        it('should solve power operations', () => {
            const cards = [
                new NumberCard(2),
                new OperatorCard('^'),
                new NumberCard(3)
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([8]);
        });

        it('should solve multiple operations', () => {
            const cards = [
                new NumberCard(2),
                new OperatorCard('+'),
                new NumberCard(3),
                new OperatorCard('*'),
                new NumberCard(4)
            ];

            // This should evaluate as: 2 + 3 * 4 = 12 but currently it does ((2 + 3) * 4) = 20
            const result = solveProblem(cards);
            expect(result).toEqual([14]);
        });

        it('should handle multiple separate problems', () => {
            const cards = [
                new NumberCard(2),
                new OperatorCard('+'),
                new NumberCard(3),
                new NumberCard(5), // Starts a new problem
                new OperatorCard('*'),
                new NumberCard(2)
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([5, 10]);
        });

        it('should handle single number', () => {
            const cards = [new NumberCard(7)];

            const result = solveProblem(cards);
            expect(result).toEqual([7]);
        });

        it('should handle multiple single numbers', () => {
            const cards = [
                new NumberCard(3),
                new NumberCard(7),
                new NumberCard(9)
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([3, 7, 9]);
        });

        it('should handle zero values', () => {
            const cards = [
                new NumberCard(5),
                new OperatorCard('+'),
                new NumberCard(0)
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([5]);
        });

        it('should handle division by zero', () => {
            const cards = [
                new NumberCard(5),
                new OperatorCard('/'),
                new NumberCard(0)
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([Infinity]);
        });

        it('should handle negative results', () => {
            const cards = [
                new NumberCard(3),
                new OperatorCard('-'),
                new NumberCard(7)
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([-4]);
        });

        it('should handle empty card array', () => {
            const result = solveProblem([]);
            expect(result).toEqual([0]); // Empty string evaluates to 0
        });

        it('should handle decimal results from division', () => {
            const cards = [
                new NumberCard(5),
                new OperatorCard('/'),
                new NumberCard(2)
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([2.5]);
        });
    });
});
