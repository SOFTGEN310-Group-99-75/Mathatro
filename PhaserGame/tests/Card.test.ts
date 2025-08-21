import { describe, it, expect } from 'vitest';
import { Card, NumberCard, OperatorCard } from '../src/Card';

describe('Card', () => {
    describe('Base Card class', () => {
        it('should create a card with default multiplier and base score', () => {
            const card = new Card(2, 20);

            expect(card.getMultiplier()).toBe(2);
            expect(card.getBaseScore()).toBe(20);
        });

        it('should allow updating multiplier', () => {
            const card = new Card(1, 10);
            card.setMultiplier(3);

            expect(card.getMultiplier()).toBe(3);
        });

        it('should allow updating base score', () => {
            const card = new Card(1, 10);
            card.setBaseScore(25);

            expect(card.getBaseScore()).toBe(25);
        });
    });

    describe('NumberCard', () => {
        it('should create a number card with correct value and defaults', () => {
            const numberCard = new NumberCard(5);

            expect(numberCard.value).toBe(5);
            expect(numberCard.isOperator).toBe(false);
            expect(numberCard.getMultiplier()).toBe(1);
            expect(numberCard.getBaseScore()).toBe(10);
        });

        it('should handle zero value', () => {
            const numberCard = new NumberCard(0);

            expect(numberCard.value).toBe(0);
            expect(numberCard.isOperator).toBe(false);
        });

        it('should handle negative numbers', () => {
            const numberCard = new NumberCard(-3);

            expect(numberCard.value).toBe(-3);
            expect(numberCard.isOperator).toBe(false);
        });

        it('should handle large numbers', () => {
            const numberCard = new NumberCard(999);

            expect(numberCard.value).toBe(999);
            expect(numberCard.isOperator).toBe(false);
        });
    });

    describe('OperatorCard', () => {
        it('should create an operator card with correct symbol and defaults', () => {
            const operatorCard = new OperatorCard('+');

            expect(operatorCard.value).toBe('+');
            expect(operatorCard.isOperator).toBe(true);
            expect(operatorCard.getMultiplier()).toBe(1);
            expect(operatorCard.getBaseScore()).toBe(10);
        });

        it('should handle different operator symbols', () => {
            const operators = ['+', '-', '*', '/', '^'];

            operators.forEach(op => {
                const operatorCard = new OperatorCard(op);
                expect(operatorCard.value).toBe(op);
                expect(operatorCard.isOperator).toBe(true);
            });
        });
    });

    describe('Card inheritance', () => {
        it('should allow NumberCard to inherit Card methods', () => {
            const numberCard = new NumberCard(7);
            numberCard.setMultiplier(2);
            numberCard.setBaseScore(15);

            expect(numberCard.getMultiplier()).toBe(2);
            expect(numberCard.getBaseScore()).toBe(15);
            expect(numberCard.value).toBe(7);
        });

        it('should allow OperatorCard to inherit Card methods', () => {
            const operatorCard = new OperatorCard('*');
            operatorCard.setMultiplier(3);
            operatorCard.setBaseScore(20);

            expect(operatorCard.getMultiplier()).toBe(3);
            expect(operatorCard.getBaseScore()).toBe(20);
            expect(operatorCard.value).toBe('*');
        });
    });
});
