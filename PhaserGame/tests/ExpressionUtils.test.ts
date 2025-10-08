import { describe, it, expect } from 'vitest';
import { evaluateExpression } from '../src/utils/ExpressionEvaluator';
import { checkObjective } from '../src/utils/ObjectiveChecker';

describe('ExpressionEvaluator', () => {
    describe('evaluateExpression', () => {
        it('should evaluate simple addition', () => {
            const result = evaluateExpression(['2', '+', '3']);
            expect(result).toBe(5);
        });

        it('should evaluate simple subtraction', () => {
            const result = evaluateExpression(['5', '-', '2']);
            expect(result).toBe(3);
        });

        it('should evaluate simple multiplication', () => {
            const result = evaluateExpression(['3', '*', '4']);
            expect(result).toBe(12);
        });

        it('should evaluate simple division', () => {
            const result = evaluateExpression(['10', '/', '2']);
            expect(result).toBe(5);
        });

        it('should handle operator aliases (x for multiplication)', () => {
            const result = evaluateExpression(['3', 'x', '4']);
            expect(result).toBe(12);
        });

        it('should handle operator aliases (÷ for division)', () => {
            const result = evaluateExpression(['10', '÷', '2']);
            expect(result).toBe(5);
        });

        it('should evaluate complex expressions with order of operations', () => {
            const result = evaluateExpression(['2', '+', '3', '*', '4']);
            expect(result).toBe(14); // 2 + (3 * 4) = 14
        });

        it('should filter out placeholder characters', () => {
            const result = evaluateExpression(['2', '?', '+', '3']);
            expect(result).toBe(5);
        });

        it('should return NaN for empty expression', () => {
            const result = evaluateExpression([]);
            expect(Number.isNaN(result)).toBe(true);
        });

        it('should return NaN for invalid expression', () => {
            const result = evaluateExpression(['invalid']);
            expect(Number.isNaN(result)).toBe(true);
        });

        it('should handle single number', () => {
            const result = evaluateExpression(['4']);
            expect(result).toBe(4);
        });


        it("should concatenate digits separated by placeholder into a single number", () => {
            const result = evaluateExpression(["1", "?", "2"]);
            expect(result).toBe(12);
        });

        it("should concatenate multiple digits with multiple placeholders", () => {
            const result = evaluateExpression(["1", "?", "?", "2", "?", "3"]);
            expect(result).toBe(123);
        });

        it("should ignore placeholders between numbers around operators", () => {
            const result = evaluateExpression(["1", "?", "2", "+", "3", "?"]);
            expect(result).toBe(15);
        });

        it("should ignore placeholders between numbers around operators", () => {
            const result = evaluateExpression(["?", "2", "?","+", "?","3"]);
            expect(result).toBe(5);
        });

        it('should evaluate expressions with negative results', () => {
            const result = evaluateExpression(['2', '-', '5']);
            expect(result).toBe(-3);
        });

        it('should handle division by zero as infinity', () => {
            const result = evaluateExpression(['5', '/', '0']);
            expect(!isFinite(result)).toBe(true);
        });
    });
});

describe('ObjectiveChecker', () => {
    describe('checkObjective', () => {
        it('should check "Equal to" objective correctly', () => {
            expect(checkObjective(10, 'Equal to 10')).toBe(true);
            expect(checkObjective(10, 'Equal to 5')).toBe(false);
        });

        it('should check "Greater than" objective correctly', () => {
            expect(checkObjective(10, 'Greater than 5')).toBe(true);
            expect(checkObjective(10, 'Greater than 10')).toBe(false);
            expect(checkObjective(10, 'Greater than 15')).toBe(false);
        });

        it('should check "Less than" objective correctly', () => {
            expect(checkObjective(5, 'Less than 10')).toBe(true);
            expect(checkObjective(10, 'Less than 10')).toBe(false);
            expect(checkObjective(15, 'Less than 10')).toBe(false);
        });

        it('should check "Even number" objective correctly', () => {
            expect(checkObjective(4, 'Even number')).toBe(true);
            expect(checkObjective(5, 'Even number')).toBe(false);
            expect(checkObjective(0, 'Even number')).toBe(true);
        });

        it('should check "Odd number" objective correctly', () => {
            expect(checkObjective(5, 'Odd number')).toBe(true);
            expect(checkObjective(4, 'Odd number')).toBe(false);
            expect(checkObjective(1, 'Odd number')).toBe(true);
        });

        it('should check "Prime number" objective correctly', () => {
            expect(checkObjective(2, 'Prime number')).toBe(true);
            expect(checkObjective(3, 'Prime number')).toBe(true);
            expect(checkObjective(5, 'Prime number')).toBe(true);
            expect(checkObjective(4, 'Prime number')).toBe(false);
            expect(checkObjective(1, 'Prime number')).toBe(false);
        });

        it('should check "Divisible by" objective correctly', () => {
            expect(checkObjective(10, 'Divisible by 5')).toBe(true);
            expect(checkObjective(10, 'Divisible by 3')).toBe(false);
            expect(checkObjective(12, 'Divisible by 4')).toBe(true);
        });

        it('should check "Power of" objective correctly', () => {
            expect(checkObjective(8, 'Power of 2')).toBe(true);
            expect(checkObjective(27, 'Power of 3')).toBe(true);
            expect(checkObjective(10, 'Power of 2')).toBe(false);
            expect(checkObjective(16, 'Power of 2')).toBe(true);
            expect(checkObjective(9, 'Power of 3')).toBe(true);
        });

        it('should check "Factor of" objective correctly', () => {
            expect(checkObjective(3, 'Factor of 12')).toBe(true);
            expect(checkObjective(4, 'Factor of 12')).toBe(true);
            expect(checkObjective(5, 'Factor of 12')).toBe(false);
            expect(checkObjective(1, 'Factor of 100')).toBe(true);
        });

        it('should return false for unknown objectives', () => {
            expect(checkObjective(10, 'Unknown objective')).toBe(false);
        });

        it('should handle edge cases for Factor of', () => {
            expect(checkObjective(0, 'Factor of 10')).toBe(false); // 0 is not a valid factor
            expect(checkObjective(10, 'Factor of 10')).toBe(true); // number is factor of itself
        });
    });
});
