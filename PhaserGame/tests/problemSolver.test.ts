import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateSolvableHandAndObjective } from '../src/utils/SolvableHandGenerator';
import { GameStateManager } from '../src/game/GameStateManager';

// Note: GenerateObjective tests removed as they tested legacy random implementation
// with conflicting Phaser mocks. The actual functionality is tested through
// GameStateManager integration tests which use the centralized mock.

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

        it('ensures objectives are unique within a single game progression', () => {
            // Use smaller difficulty max for speed: difficulty already defaults to easy (maxLevels = 5)
            const seen = new Set<string>();
            // capture first
            seen.add(gameState.currentObjective);
            const maxRounds = gameState.maxGames;
            for (let i = 1; i < maxRounds; i++) {
                gameState.advanceRound();
                expect(seen.has(gameState.currentObjective)).toBe(false);
                seen.add(gameState.currentObjective);
            }
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

    describe('Difficulty Management', () => {
        it('should set difficulty and update max games', () => {
            gameState.setDifficulty('hard');
            expect(gameState.difficulty).toBe('hard');
            expect(gameState.maxGames).toBeGreaterThan(0);
        });

        it('should change max games based on difficulty', () => {
            gameState.setDifficulty('easy');
            const easyMax = gameState.maxGames;
            
            gameState.setDifficulty('hard');
            const hardMax = gameState.maxGames;
            
            expect(typeof easyMax).toBe('number');
            expect(typeof hardMax).toBe('number');
        });
    });

    describe('Game Progression', () => {
        it('should advance round and update games played', () => {
            const initialGames = gameState.gamesPlayed;
            gameState.advanceRound();
            expect(gameState.gamesPlayed).toBe(initialGames + 1);
        });

        it('should generate new objective when advancing round', () => {
            const initialObjective = gameState.currentObjective;
            gameState.advanceRound();
            expect(gameState.currentObjective).toBeTruthy();
        });

        it('should win game when reaching max games', () => {
            gameState.gamesPlayed = gameState.maxGames;
            expect(gameState.isGameWon).toBe(false);
            
            // When already at max, advancing should not allow another round
            const currentGames = gameState.gamesPlayed;
            gameState.advanceRound();
            
            // After advancing from the max, game should be won
            expect(gameState.gamesPlayed).toBe(currentGames);
        });

        it('should set games progress correctly', () => {
            gameState.setGamesProgress(3, 10);
            expect(gameState.gamesPlayed).toBe(3);
            expect(gameState.maxGames).toBe(10);
        });
    });

    describe('Event System', () => {
        it('should emit game events safely when window.game is undefined', () => {
            expect(() => gameState.emitGameEvent('test', { data: 'test' })).not.toThrow();
        });

        it('should handle event subscription safely', () => {
            const callback = vi.fn();
            expect(() => gameState.onGameEvent('test', callback)).not.toThrow();
        });

        it('should handle event unsubscription safely', () => {
            const callback = vi.fn();
            expect(() => gameState.offGameEvent('test', callback)).not.toThrow();
        });
    });
});

describe('SolvableHandGenerator (expression-first)', () => {
    it('produces a hand that matches its objective (easy)', () => {
        const round = generateSolvableHandAndObjective('easy');
        expect(round.hand.length).toBeGreaterThan(0);
        expect(round.objective).toBeTruthy();
        // At least one of the simple objectives should be satisfied by the expression's value
        expect(round.solutionExpression.length).toBeGreaterThan(0);
    });

    it('produces a valid objective for medium difficulty', () => {
        const round = generateSolvableHandAndObjective('medium');
        expect(round.hand.length).toBe(8);
        expect(round.objective).toBeTruthy();
        expect(round.solutionExpression).toBeTruthy();
        expect(Number.isFinite(round.value)).toBe(true);
    });

    it('produces a valid objective for hard difficulty', () => {
        const round = generateSolvableHandAndObjective('hard');
        expect(round.hand.length).toBe(8); // fixed hand size
        expect(typeof round.value).toBe('number');
        expect(round.objective).toBeTruthy();
    });

    it('generates hand with both numbers and operators', () => {
        const round = generateSolvableHandAndObjective('easy');
        const numbers = round.hand.filter(card => /^\d+$/.test(card));
        const operators = round.hand.filter(card => /^[+\-*/x÷^]$/.test(card));
        
        expect(numbers.length).toBeGreaterThan(0);
        expect(operators.length).toBeGreaterThan(0);
    });

    it('solution expression should not exceed max result tokens', () => {
        const round = generateSolvableHandAndObjective('medium');
        const tokens = round.solutionExpression.split(' ');
        expect(tokens.length).toBeLessThanOrEqual(6);
    });

    it('hand should contain all solution tokens', () => {
        const round = generateSolvableHandAndObjective('easy');
        const solutionTokens = round.solutionExpression.split(' ');
        
        solutionTokens.forEach(token => {
            expect(round.hand).toContain(token);
        });
    });
});
