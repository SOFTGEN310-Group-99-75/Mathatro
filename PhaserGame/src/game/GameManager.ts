import { GameStateManager } from './GameStateManager';

/**
 * GameManager - Centralized game coordination
 * Handles game state management and coordinates between scenes
 * Implements proper separation of concerns
 */
export class GameManager {
    private static instance: GameManager;
    private readonly gameState: GameStateManager;
    private scene: Phaser.Scene | null = null;

    private constructor() {
        this.gameState = new GameStateManager();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    /**
     * Initialize with a scene (usually the main Play scene)
     */
    public initialize(scene: Phaser.Scene): void {
        this.scene = scene;
        this.setupGameEventListeners();
        this.gameState.initializeGame();
    }

    /**
     * Get the game state manager
     */
    public getGameState(): GameStateManager {
        return this.gameState;
    }

    /**
     * Generate a new objective using game state
     */
    public generateObjective(): string {
        return this.gameState.generateObjective();
    }

    /**
     * Set objective in game state
     */
    public setObjective(objective: string): void {
        this.gameState.setObjective(objective);
    }

    /**
     * Get current objective from game state
     */
    public getCurrentObjective(): string {
        return this.gameState.currentObjective;
    }

    /**
     * Update score
     */
    public updateScore(points: number): void {
        this.gameState.updateScore(points);
    }

    /**
     * Get current score
     */
    public getCurrentScore(): number {
        return this.gameState.score;
    }

    /**
     * Update lives
     */
    public updateLives(delta: number): void {
        this.gameState.updateLives(delta);
    }

    /**
     * Get current lives
     */
    public getCurrentLives(): number {
        return this.gameState.lives;
    }

    /**
     * Get health ratio
     */
    public getHealthRatio(): number {
        return this.gameState.getHealthRatio();
    }

    /**
     * Start a new game
     */
    public startNewGame(): void {
        this.gameState.startNewGame();
    }

    /**
     * Restart the current game
     */
    public restartGame(): void {
        this.gameState.restartGame();
    }

    /**
     * Get game status
     */
    public getGameStatus() {
        return this.gameState.getGameStatus();
    }

    /**
     * Setup event listeners to coordinate between scenes
     */
    private setupGameEventListeners(): void {
        // Listen to game state events and coordinate with scenes
        this.gameState.onGameEvent('scoreChanged', (score: number) => {
            if (this.scene?.scene.isActive('GameUI')) {
                const gameUIScene = this.scene.scene.get('GameUI') as any;
                gameUIScene.setScore?.(score);
            }
        });

        this.gameState.onGameEvent('livesChanged', (lives: number) => {
            if (this.scene?.scene.isActive('GameUI')) {
                const healthRatio = this.gameState.getHealthRatio();
                const gameUIScene = this.scene.scene.get('GameUI') as any;
                gameUIScene.setHealth?.(healthRatio);
            }
        });

        this.gameState.onGameEvent('objectiveChanged', (objective: string) => {
            if (this.scene?.scene.isActive('GameUI')) {
                const gameUIScene = this.scene.scene.get('GameUI') as any;
                gameUIScene.setObjective?.(objective);
            }
        });

        this.gameState.onGameEvent('gameWon', (data: any) => {
            if (this.scene?.scene.isActive('Play')) {
                this.showGameWon();
            }
        });

        this.gameState.onGameEvent('gameOver', (data: any) => {
            if (this.scene?.scene.isActive('Play')) {
                this.showGameOver();
            }
        });
    }

    /**
     * Show game won message
     */
    private showGameWon(): void {
        if (this.scene) {
            const winnerText = this.scene.children.getByName('winnerText') as Phaser.GameObjects.Text;
            if (winnerText) {
                winnerText.setPosition(this.scene.sys.game.scale.width / 2, this.scene.sys.game.scale.height / 2);
                winnerText.setInteractive();
                winnerText.on('pointerdown', () => {
                    this.restartGame();
                });
            }
        }
    }

    /**
     * Show game over message
     */
    private showGameOver(): void {
        if (this.scene) {
            const gameOverText = this.scene.children.getByName('gameOverText') as Phaser.GameObjects.Text;
            if (gameOverText) {
                gameOverText.setPosition(this.scene.sys.game.scale.width / 2, this.scene.sys.game.scale.height / 2);
                gameOverText.setInteractive();
                gameOverText.on('pointerdown', () => {
                    this.restartGame();
                });
            }
        }
    }
}
