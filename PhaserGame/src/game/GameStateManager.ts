import { DIFFICULTY_CONFIG, DifficultyMode, GAME_CONFIG } from '../config/GameConstants';
import { GenerateObjective } from '../GenerateObjective';
import { evaluateExpression } from '../utils/ExpressionEvaluator'; 
import Phaser from 'phaser';


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
    public difficulty: DifficultyMode = 'easy';


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
        this.maxGames = DIFFICULTY_CONFIG[this.difficulty].maxLevels;


        // Initialize game
        this.initializeGame();
    }

    /**
     * Initialize the game with starting values
     */
    initializeGame() {
        // Generate a hand of cards based on difficulty
        const hand = this.generateHandCards();
        this.setHandCards(hand);

        // Generate a random objective
        this.currentObjective = this.generateObjective();
        this.emitGameEvent('objectiveChanged', this.currentObjective);

        this.isGameActive = true;
        this.isGameWon = false;
        this.isGameOver = false;
    }

/**
     * Generate a new objective for the current game
     */
    generateObjective(): string {
        return GenerateObjective(this.difficulty);
    }

    /**
     * Update the current objective
     */
    setObjective(objective: string): void {
        this.currentObjective = objective; // use the passed-in value
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



    setDifficulty(mode: DifficultyMode) {
    this.difficulty = mode;
    const config = DIFFICULTY_CONFIG[mode];
    this.maxGames = config.maxLevels;
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

    restartGame(): void {
    this.lives = GAME_CONFIG.INITIAL_LIVES;
    this.score = GAME_CONFIG.DEFAULT_SCORE;
    this.currentLevel = GAME_CONFIG.DEFAULT_LEVEL;
    this.gamesPlayed = 1; // <-- correct
    this.maxGames = DIFFICULTY_CONFIG[this.difficulty].maxLevels; // <-- use correct max per difficulty

    const hand = this.generateHandCards();
    this.setHandCards(hand);

    this.currentObjective = this.generateObjective();
    this.emitGameEvent('objectiveChanged', this.currentObjective);

    this.isGameActive = true;
    this.isGameOver = false;
    this.isGameWon = false;

    // Emit progress update immediately so UI shows 1 / max
    this.emitGameEvent('gamesProgressChanged', {
        current: this.gamesPlayed,
        total: this.maxGames
    });
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


    advanceRound() {
        if (this.gamesPlayed < this.maxGames) {
            this.gamesPlayed++;

            // Generate a new random objective
            this.currentObjective = this.generateObjective();
            this.emitGameEvent('objectiveChanged', this.currentObjective);

            // Generate a new random hand of cards
            const hand = this.generateHandCards();
            this.setHandCards(hand);

            // Emit progress
            this.emitGameEvent('gamesProgressChanged', {
                current: this.gamesPlayed,
                total: this.maxGames
            });
        } else {
            this.gameWin();
        }
    }


    generateHandCards(): string[] {
    const config = DIFFICULTY_CONFIG[this.difficulty];

    const nums = Array.from({ length: 5 }, () =>
        Phaser.Math.Between(config.minNumber, config.maxNumber).toString()
    );

    // Shuffle operator pool and take up to 3 unique ones
    const shuffledOps = Phaser.Utils.Array.Shuffle([...config.operators]);
    const ops = shuffledOps.slice(0, 3);

    return [...nums, ...ops];
    }




}
