import { DIFFICULTY_CONFIG, DifficultyMode, GAME_CONFIG } from '../config/GameConstants';
import { GenerateObjective } from '../GenerateObjective';
import Phaser from 'phaser';
import { generateSolvableHandAndObjective } from '../utils/SolvableHandGenerator';
import { isObjectiveSolvable } from '../utils/ExpressionSolver';


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

// Holds all the game state - health, score, cards, etc.
// Keeps game logic separate from UI rendering
export class GameStateManager {
    // Player stuff
    public lives: number;
    public score: number;
    public currentLevel: number;
    public currentObjective: string;
    public isGameActive: boolean;
    public isGameWon: boolean;
    public isGameOver: boolean;

    // What cards are in play
    public handCards: any[];
    public resultCards: any[];
    public availableCards: any[];

    // Progress tracking
    public gamesPlayed: number;
    public maxGames: number;
    public difficulty: DifficultyMode = 'easy';
    // Don't repeat objectives in same game session
    private usedObjectives: Set<string> = new Set();


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

    // Set up a new game with initial values
    initializeGame() {
        this.usedObjectives = new Set();
        const solvable = this.generateUniqueSolvableRound();
        this.setHandCards(solvable.hand);
        this.currentObjective = solvable.objective;
        this.usedObjectives.add(this.currentObjective);
        this.emitGameEvent('objectiveChanged', this.currentObjective);

        this.isGameActive = true;
        this.isGameWon = false;
        this.isGameOver = false;
    }

    // Generate random objective based on difficulty
    generateObjective(): string {
        // Keep legacy function for compatibility, though main flow now uses expression-first generation
        return GenerateObjective(this.difficulty);
    }

    // Set a new objective and notify listeners
    setObjective(objective: string): void {
        this.currentObjective = objective;
        this.emitGameEvent('objectiveChanged', objective);
    }


    // Create and set a new random objective
    generateNewObjective(): string {
        const newObjective = this.generateObjective();
        this.setObjective(newObjective);
        return newObjective;
    }

    // Add points to the score
    updateScore(points: number): void {
        this.score += points;
        this.emitGameEvent('scoreChanged', this.score);
    }

    // Set score to exact value
    setScore(score: number): void {
        this.score = score;
        this.emitGameEvent('scoreChanged', this.score);
    }

    // Change lives by delta amount (positive or negative)
    updateLives(delta: number): void {
        this.lives = Math.max(0, Math.min(GAME_CONFIG.INITIAL_LIVES, this.lives + delta));
        this.emitGameEvent('livesChanged', this.lives);

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    // Set lives to exact value
    setLives(lives: number): void {
        this.lives = Math.max(0, Math.min(GAME_CONFIG.INITIAL_LIVES, lives));
        this.emitGameEvent('livesChanged', this.lives);

        if (this.lives <= 0) {
            this.gameOver();
        }
    }



    // Change game difficulty (easy/medium/hard)
    setDifficulty(mode: DifficultyMode) {
        this.difficulty = mode;
        const config = DIFFICULTY_CONFIG[mode];
        this.maxGames = config.maxLevels;
    }

    // Get health as percentage (0.0 to 1.0)
    getHealthRatio(): number {
        return this.lives / GAME_CONFIG.INITIAL_LIVES;
    }

    // Update round counter display
    setGamesProgress(current: number, total: number): void {
        this.gamesPlayed = current;
        this.maxGames = total;
        this.emitGameEvent('gamesProgressChanged', { current, total });
    }

    // Trigger win state when player beats all rounds
    gameWin(): void {
        this.isGameWon = true;
        this.isGameActive = false;
        this.emitGameEvent('gameWon', { score: this.score, level: this.currentLevel });
    }

    // Trigger game over state when lives hit zero
    gameOver(): void {
        this.isGameOver = true;
        this.isGameActive = false;
        this.emitGameEvent('gameOver', { score: this.score, level: this.currentLevel });
    }

    // Begin a fresh game session
    startNewGame(): void {
        this.initializeGame();
        this.emitGameEvent('gameStarted');
    }

    // Reset everything and start over
    restartGame(): void {
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.score = GAME_CONFIG.DEFAULT_SCORE;
        this.currentLevel = GAME_CONFIG.DEFAULT_LEVEL;
        this.gamesPlayed = 1;
        this.maxGames = DIFFICULTY_CONFIG[this.difficulty].maxLevels;
        this.usedObjectives = new Set();

        const solvable = this.generateUniqueSolvableRound();
        this.setHandCards(solvable.hand);
        this.currentObjective = solvable.objective;
        this.usedObjectives.add(this.currentObjective);
        this.emitGameEvent('objectiveChanged', this.currentObjective);

        this.isGameActive = true;
        this.isGameOver = false;
        this.isGameWon = false;

        this.emitGameEvent('gamesProgressChanged', {
            current: this.gamesPlayed,
            total: this.maxGames
        });
    }



    // Update the player's hand of cards
    setHandCards(cards: any[]): void {
        this.handCards = [...cards];
        this.emitGameEvent('handCardsChanged', this.handCards);
    }

    // Update the result area cards
    setResultCards(cards: any[]): void {
        this.resultCards = [...cards];
        this.emitGameEvent('resultCardsChanged', this.resultCards);
    }

    // Get complete game state snapshot
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

    // Fire an event that UI can listen to
    emitGameEvent(eventType: string, data: any = null): void {
        // This will be connected to Phaser's event system
        if (typeof window !== 'undefined' && (window as any).game) {
            (window as any).game.events.emit(`game:${eventType}`, data);
        }
    }

    // Listen for game state changes
    onGameEvent(eventType: string, callback: (data?: any) => void): void {
        if (typeof window !== 'undefined' && (window as any).game) {
            (window as any).game.events.on(`game:${eventType}`, callback);
        }
    }

    // Stop listening to game state changes
    offGameEvent(eventType: string, callback: (data?: any) => void): void {
        if (typeof window !== 'undefined' && (window as any).game) {
            (window as any).game.events.off(`game:${eventType}`, callback);
        }
    }


    // Move to the next round or trigger win
    advanceRound() {
        if (this.gamesPlayed < this.maxGames) {
            this.gamesPlayed++;
            const solvable = this.generateUniqueSolvableRound();
            this.setHandCards(solvable.hand);
            this.currentObjective = solvable.objective;
            this.usedObjectives.add(this.currentObjective);
            this.emitGameEvent('objectiveChanged', this.currentObjective);

            this.emitGameEvent('gamesProgressChanged', {
                current: this.gamesPlayed,
                total: this.maxGames
            });
        } else {
            this.gameWin();
        }
    }


    // Create random hand of number and operator cards
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

    // Generate a round that's actually solvable AND hasn't been used yet
    // This took way too long to debug but it works now
    private generateUniqueSolvableRound(maxAttempts: number = 200) {
        let lastRound = generateSolvableHandAndObjective(this.difficulty);
        // Phase 1: try to get a unique solvable objective
        for (let i = 0; i < maxAttempts; i++) {
            const round = i === 0 ? lastRound : generateSolvableHandAndObjective(this.difficulty);
            lastRound = round;
            if (this.usedObjectives.has(round.objective)) continue; // skip if we've seen this before
            const validation = isObjectiveSolvable(round.hand, round.objective, { maxNumbers: 3 });
            console.debug('[RoundGen][Phase1]', { attempt: i, validated: validation.solvable });
            if (validation.solvable) return round;
        }
        // Phase 2: okay fine, we'll allow repeats but it still has to be solvable
        for (let j = 0; j < 100; j++) {
            const round = generateSolvableHandAndObjective(this.difficulty);
            const validation = isObjectiveSolvable(round.hand, round.objective, { maxNumbers: 3 });
            console.warn('[RoundGen][Phase2]', { attempt: j, validated: validation.solvable });
            if (validation.solvable) return round;
        }
        // Emergency escape hatch: give them 1+1=2 if all else fails
        const fallback = {
            hand: ['1', '1', '+', '+', '2', '3', '+', '4'],
            objective: 'Equal to 2',
            solutionExpression: '1 + 1',
            value: 2
        };
        console.error('[RoundGen][Fallback]', fallback);
        return fallback;
    }




}
