import { GAME_CONFIG } from '../config/GameConstants';
import { GenerateObjective } from '../GenerateObjective';

// Type definitions
interface GameStatus {
    lives: number;
    score: number;
    currentLevel: number;
    currentObjective: string;
    gamesPlayed: number;
    maxGames: number;
    isGameActive: boolean;
    isGameWon: boolean;
    isGameOver: boolean;
    healthRatio: number;
}

interface GamesProgress {
    current: number;
    total: number;
}

interface GameEventData {
    score?: number;
    level?: number;
}

/**
 * GameStateManager - Handles all game state and core game logic
 * Separated from UI concerns for better maintainability and testability
 */
export class GameStateManager {
    // Game state
    public lives: number;
    public score: number;
    public currentLevel: number;
    public currentObjective: string;
    public isGameActive: boolean;
    public isGameWon: boolean;
    public isGameOver: boolean;

    // Card state
    public handCards: any[];
    public resultCards: any[];
    public availableCards: any[];

    // Game progression
    public gamesPlayed: number;
    public maxGames: number;

    constructor() {
        // Game state
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.score = GAME_CONFIG.DEFAULT_SCORE;
        this.currentLevel = GAME_CONFIG.DEFAULT_LEVEL;
        this.currentObjective = '';
        this.isGameActive = false;
        this.isGameWon = false;
        this.isGameOver = false;

        // Card state
        this.handCards = [];
        this.resultCards = [];
        this.availableCards = [];

        // Game progression
        this.gamesPlayed = 1;
        this.maxGames = GAME_CONFIG.MAX_LEVELS;

        // Initialize game
        this.initializeGame();
    }

    /**
     * Initialize the game with starting values
     */
    initializeGame() {
        this.currentObjective = this.generateObjective();
        this.isGameActive = true;
        this.isGameWon = false;
        this.isGameOver = false;
    }

    /**
     * Generate a new objective for the current game
     */
    generateObjective(): string {
        return GenerateObjective();
    }

    /**
     * Update the current objective
     */
    setObjective(objective: string): void {
        this.currentObjective = objective;
        this.emitGameEvent('objectiveChanged', objective);
    }

    /**
     * Generate a new objective and update state
     */
    generateNewObjective(): string {
        const newObjective = this.generateObjective();
        this.setObjective(newObjective);
        return newObjective;
    }

    /**
     * Update player score
     */
    updateScore(points: number): void {
        this.score += points;
        this.emitGameEvent('scoreChanged', this.score);
    }

    /**
     * Set player score directly
     */
    setScore(score: number): void {
        this.score = score;
        this.emitGameEvent('scoreChanged', this.score);
    }

    /**
     * Update player health/lives
     */
    updateLives(delta: number): void {
        this.lives = Math.max(0, Math.min(GAME_CONFIG.INITIAL_LIVES, this.lives + delta));
        this.emitGameEvent('livesChanged', this.lives);

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    /**
     * Set lives directly
     */
    setLives(lives: number): void {
        this.lives = Math.max(0, Math.min(GAME_CONFIG.INITIAL_LIVES, lives));
        this.emitGameEvent('livesChanged', this.lives);

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    /**
     * Get current health ratio (0-1)
     */
    getHealthRatio(): number {
        return this.lives / GAME_CONFIG.INITIAL_LIVES;
    }

    /**
     * Update game progression
     */
    setGamesProgress(current: number, total: number): void {
        this.gamesPlayed = current;
        this.maxGames = total;
        this.emitGameEvent('gamesProgressChanged', { current, total });
    }

    /**
     * Handle game win
     */
    gameWin(): void {
        this.isGameWon = true;
        this.isGameActive = false;
        this.emitGameEvent('gameWon', { score: this.score, level: this.currentLevel });
    }

    /**
     * Handle game over
     */
    gameOver(): void {
        this.isGameOver = true;
        this.isGameActive = false;
        this.emitGameEvent('gameOver', { score: this.score, level: this.currentLevel });
    }

    /**
     * Start a new game
     */
    startNewGame(): void {
        this.initializeGame();
        this.emitGameEvent('gameStarted');
    }

    /**
     * Restart the current game
     */
    restartGame(): void {
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.score = GAME_CONFIG.DEFAULT_SCORE;
        this.currentLevel = GAME_CONFIG.DEFAULT_LEVEL;
        this.gamesPlayed = 1;
        this.startNewGame();
    }

    /**
     * Update hand cards
     */
    setHandCards(cards: any[]): void {
        this.handCards = [...cards];
        this.emitGameEvent('handCardsChanged', this.handCards);
    }

    /**
     * Update result cards
     */
    setResultCards(cards: any[]): void {
        this.resultCards = [...cards];
        this.emitGameEvent('resultCardsChanged', this.resultCards);
    }

    /**
     * Get current game status
     */
    getGameStatus(): GameStatus {
        return {
            lives: this.lives,
            score: this.score,
            currentLevel: this.currentLevel,
            currentObjective: this.currentObjective,
            gamesPlayed: this.gamesPlayed,
            maxGames: this.maxGames,
            isGameActive: this.isGameActive,
            isGameWon: this.isGameWon,
            isGameOver: this.isGameOver,
            healthRatio: this.getHealthRatio()
        };
    }

    /**
     * Emit game events for UI to listen to
     */
    emitGameEvent(eventType: string, data: any = null): void {
        // This will be connected to Phaser's event system
        if (typeof window !== 'undefined' && (window as any).game) {
            (window as any).game.events.emit(`game:${eventType}`, data);
        }
    }

    /**
     * Subscribe to game events
     */
    onGameEvent(eventType: string, callback: (data?: any) => void): void {
        if (typeof window !== 'undefined' && (window as any).game) {
            (window as any).game.events.on(`game:${eventType}`, callback);
        }
    }

    /**
     * Unsubscribe from game events
     */
    offGameEvent(eventType: string, callback: (data?: any) => void): void {
        if (typeof window !== 'undefined' && (window as any).game) {
            (window as any).game.events.off(`game:${eventType}`, callback);
        }
    }
}
