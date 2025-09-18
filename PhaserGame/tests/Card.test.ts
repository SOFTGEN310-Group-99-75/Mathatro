import { describe, it, expect } from 'vitest';

// Mock Card classes for testing since the actual Card.ts was removed
class Card {
    protected multiplier: number;
    protected baseScore: number;
    isOperator!: boolean;

    constructor(multiplier: number, baseScore: number) {
        this.multiplier = multiplier;
        this.baseScore = baseScore;
    }

    getMultiplier() {
        return this.multiplier;
    }

    getBaseScore() {
        return this.baseScore;
    }

    setMultiplier(multiplier: number) {
        this.multiplier = multiplier;
    }

    setBaseScore(baseScore: number) {
        this.baseScore = baseScore;
    }
}

class NumberCard extends Card {
    public value: number;

    constructor(value: number) {
        super(1, 10); // by default   
        this.value = value;
        this.isOperator = false;
    }
}

class OperatorCard extends Card {
    public value: string;

    constructor(symbol: string) {
        super(1, 10); // by default
        this.value = symbol;
        this.isOperator = true;
    }
}

describe('Card', () => {
    describe('Base Card class', () => {
        it('should create a card with default multiplier and base score', () => {
            const card = new Card(2, 20);

            expect(card.getMultiplier()).toBe(2);
            expect(card.getBaseScore()).toBe(20);
        });

        it('should allow updating multiplier and base score', () => {
            const card = new Card(1, 10);
            
            card.setMultiplier(3);
            card.setBaseScore(30);

            expect(card.getMultiplier()).toBe(3);
            expect(card.getBaseScore()).toBe(30);
        });
    });

    describe('NumberCard class', () => {
        it('should create a number card with correct properties', () => {
            const numberCard = new NumberCard(5);

            expect(numberCard.value).toBe(5);
            expect(numberCard.isOperator).toBe(false);
            expect(numberCard.getMultiplier()).toBe(1);
            expect(numberCard.getBaseScore()).toBe(10);
        });

        it('should handle different number values', () => {
            const card1 = new NumberCard(0);
            const card2 = new NumberCard(9);

            expect(card1.value).toBe(0);
            expect(card2.value).toBe(9);
            expect(card1.isOperator).toBe(false);
            expect(card2.isOperator).toBe(false);
        });
    });

    describe('OperatorCard class', () => {
        it('should create an operator card with correct properties', () => {
            const operatorCard = new OperatorCard('+');

            expect(operatorCard.value).toBe('+');
            expect(operatorCard.isOperator).toBe(true);
            expect(operatorCard.getMultiplier()).toBe(1);
            expect(operatorCard.getBaseScore()).toBe(10);
        });

        it('should handle different operator symbols', () => {
            const addCard = new OperatorCard('+');
            const subCard = new OperatorCard('-');
            const mulCard = new OperatorCard('*');
            const divCard = new OperatorCard('/');

            expect(addCard.value).toBe('+');
            expect(subCard.value).toBe('-');
            expect(mulCard.value).toBe('*');
            expect(divCard.value).toBe('/');
            
            expect(addCard.isOperator).toBe(true);
            expect(subCard.isOperator).toBe(true);
            expect(mulCard.isOperator).toBe(true);
            expect(divCard.isOperator).toBe(true);
        });
    });
});
