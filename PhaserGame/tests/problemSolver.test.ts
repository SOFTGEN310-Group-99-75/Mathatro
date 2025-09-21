import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateObjective, generateNonPrime } from '../src/GenerateObjective';
import { GameStateManager } from '../src/game/GameStateManager';

// Mock Phaser.Math for testing
const mockPhaserMath = {
    Between: vi.fn()
};
// Mock Phaser globally for testing
(globalThis as any).Phaser = {
    Math: mockPhaserMath
};

describe('GenerateObjective', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GenerateObjective function', () => {
        it('should generate comparison objectives', () => {
            mockPhaserMath.Between
                .mockReturnValueOnce(0) // "Greater than" index
                .mockReturnValueOnce(10); // number value

            const objective = GenerateObjective();
            expect(objective).toBe('Greater than 10');
        });

        it('should generate factor objectives', () => {
            mockPhaserMath.Between
                .mockReturnValueOnce(3) // "Factor of" index
                .mockReturnValueOnce(12); // non-prime number

            const objective = GenerateObjective();
            expect(objective).toBe('Factor of 12');
        });

        it('should generate divisible by objectives', () => {
            mockPhaserMath.Between
                .mockReturnValueOnce(4) // "Divisible by" index
                .mockReturnValueOnce(5); // divisor

            const objective = GenerateObjective();
            expect(objective).toBe('Divisible by 5');
        });

        it('should generate power objectives', () => {
            mockPhaserMath.Between
                .mockReturnValueOnce(5) // "Power of" index
                .mockReturnValueOnce(3); // power

            const objective = GenerateObjective();
            expect(objective).toBe('Power of 3');
        });

        it('should generate simple objectives without parameters', () => {
            mockPhaserMath.Between.mockReturnValueOnce(6); // "Prime number" index

            const objective = GenerateObjective();
            expect(objective).toBe('Prime number');
        });
    });

    describe('generateNonPrime function', () => {
        it('should return a non-prime number', () => {
            mockPhaserMath.Between
                .mockReturnValueOnce(4) // first call returns 4 (not prime)
                .mockReturnValueOnce(12); // second call returns 12 (not prime)

            const result = generateNonPrime();
            expect(result).toBe(4);
        });

        it('should retry when prime number is generated', () => {
            mockPhaserMath.Between
                .mockReturnValueOnce(7) // first call returns 7 (prime)
                .mockReturnValueOnce(8); // second call returns 8 (not prime)

            const result = generateNonPrime();
            expect(result).toBe(8);
            expect(mockPhaserMath.Between).toHaveBeenCalledTimes(2);
        });
    });
});

describe('GameStateManager', () => {
    let gameState: GameStateManager;

    beforeEach(() => {
        gameState = new GameStateManager();
    });

    describe('Initialization', () => {
        it('should initialize with default values', () => {
            expect(gameState.lives).toBeGreaterThan(0);
            expect(gameState.score).toBe(0);
            expect(gameState.currentLevel).toBe(1);
            expect(gameState.isGameActive).toBe(true);
            expect(gameState.isGameWon).toBe(false);
            expect(gameState.isGameOver).toBe(false);
        });

        it('should have an initial objective', () => {
            expect(gameState.currentObjective).toBeTruthy();
            expect(typeof gameState.currentObjective).toBe('string');
        });
    });

    describe('Score Management', () => {
        it('should update score correctly', () => {
            const initialScore = gameState.score;
            gameState.updateScore(10);
            expect(gameState.score).toBe(initialScore + 10);
        });

        it('should set score directly', () => {
            gameState.setScore(100);
            expect(gameState.score).toBe(100);
        });
    });

    describe('Lives Management', () => {
        it('should update lives correctly', () => {
            const initialLives = gameState.lives;
            gameState.updateLives(-1);
            expect(gameState.lives).toBe(initialLives - 1);
        });

        it('should not go below 0 lives', () => {
            gameState.setLives(0);
            expect(gameState.lives).toBe(0);
        });

        it('should trigger game over when lives reach 0', () => {
            gameState.setLives(0);
            expect(gameState.isGameOver).toBe(true);
            expect(gameState.isGameActive).toBe(false);
        });
    });

    describe('Objective Management', () => {
        it('should generate new objectives', () => {
            const newObjective = gameState.generateNewObjective();

            expect(newObjective).toBeTruthy();
            expect(newObjective).toBe(gameState.currentObjective);
        });

        it('should set objective directly', () => {
            const testObjective = 'Test objective';
            gameState.setObjective(testObjective);
            expect(gameState.currentObjective).toBe(testObjective);
        });
    });

    describe('Game State Management', () => {
        it('should handle game win', () => {
            gameState.gameWin();
            expect(gameState.isGameWon).toBe(true);
            expect(gameState.isGameActive).toBe(false);
        });

        it('should handle game over', () => {
            gameState.gameOver();
            expect(gameState.isGameOver).toBe(true);
            expect(gameState.isGameActive).toBe(false);
        });

        it('should restart game correctly', () => {
            gameState.updateScore(50);
            gameState.updateLives(-1);
            gameState.restartGame();

            expect(gameState.score).toBe(0);
            expect(gameState.lives).toBeGreaterThan(0);
            expect(gameState.isGameActive).toBe(true);
            expect(gameState.isGameOver).toBe(false);
            expect(gameState.isGameWon).toBe(false);
        });
    });

    describe('Card Management', () => {
        it('should update hand cards', () => {
            const testCards = ['card1', 'card2'];
            gameState.setHandCards(testCards);
            expect(gameState.handCards).toEqual(testCards);
        });

        it('should update result cards', () => {
            const testCards = ['result1', 'result2'];
            gameState.setResultCards(testCards);
            expect(gameState.resultCards).toEqual(testCards);
        });
    });

    describe('Game Status', () => {
        it('should return current game status', () => {
            const status = gameState.getGameStatus();

            expect(status).toHaveProperty('lives');
            expect(status).toHaveProperty('score');
            expect(status).toHaveProperty('currentLevel');
            expect(status).toHaveProperty('currentObjective');
            expect(status).toHaveProperty('isGameActive');
            expect(status).toHaveProperty('isGameWon');
            expect(status).toHaveProperty('isGameOver');
            expect(status).toHaveProperty('healthRatio');
        });

        it('should calculate health ratio correctly', () => {
            const healthRatio = gameState.getHealthRatio();
            expect(healthRatio).toBeGreaterThanOrEqual(0);
            expect(healthRatio).toBeLessThanOrEqual(1);
        });
    });
});
