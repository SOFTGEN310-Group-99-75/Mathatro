import Phaser from 'phaser';
import { GAME_CONFIG } from './config/GameConstants';
import { createTitleText, createVolumeButton } from './utils/UIHelpers';
import { GameManager } from './game/GameManager';
import { UserProfile } from './auth/UserProfile';

/**
 * Maths Card Game
 * -----------------------------------------------
 *
 * Test your math skills in this fun and challenging game!
 *
 * Music credits:
 * "Fat Caps" by Audionautix is licensed under the Creative Commons Attribution 4.0 license. https://creativecommons.org/licenses/by/4.0/
 * Artist http://audionautix.com/
 */
export class Play extends Phaser.Scene {
    // Game manager - centralized game coordination
    private gameManager!: GameManager;
    private userProfile: UserProfile;


    constructor() {
        super({
            key: 'Play'
        });
    }

    init() {
        // Initialize game manager (singleton)
        this.gameManager = GameManager.getInstance();
        this.gameManager.initialize(this);

        // Fadein camera
        this.cameras.main.fadeIn(GAME_CONFIG.ANIMATION.FADE_DURATION);
        this.createVolumeButton();
    }


    private readonly difficultyButtons: Phaser.GameObjects.Text[] = [];

    create() {
        const { width, height } = this.sys.game.scale;

        createTitleText(this, width / 2, height / 4, "Mathatro", { fontSize: 48 });

        this.add.text(width / 2, height / 3, "Select Difficulty", {
            fontSize: "24px",
            color: "#000000"
        }).setOrigin(0.5);

        const makeButton = (label: string, y: number, mode: 'easy' | 'medium' | 'hard') => {
            const btn = this.add.text(width / 2, y, label, {
                fontSize: "32px",
                backgroundColor: "#8c7ae6",
                color: "#ffffff",
                padding: { left: 12, right: 12, top: 6, bottom: 6 }
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => btn.setStyle({ backgroundColor: "#9c88ff" }))
            .on("pointerout", () => btn.setStyle({ backgroundColor: "#8c7ae6" }))
            .on("pointerdown", () => {
                const state = this.gameManager.getGameState();

                state.setDifficulty(mode);
                state.restartGame();

                this.difficultyButtons.forEach(b => b.destroy());
                if (!this.sound.get("theme-song")) {
                    this.sound.play("theme-song", { loop: true, volume: GAME_CONFIG.AUDIO.THEME_VOLUME });
                }
                this.scene.stop('Play');
                this.scene.start('GameUI');
            });


            this.difficultyButtons.push(btn);
        };

        makeButton("Easy", height / 2, "easy");
        makeButton("Medium", height / 2 + 60, "medium");
        makeButton("Hard", height / 2 + 120, "hard");

        // Create user profile component at bottom right
        this.userProfile = new UserProfile(this);
        this.userProfile.create(width - 120, height - 60);
    }

    restartGame() {
        // Restart game using GameManager
        this.gameManager.restartGame();
    }

    createVolumeButton() {
        return createVolumeButton(this);
    }

    shutdown() {
        // Clean up user profile when scene shuts down
        if (this.userProfile) {
            this.userProfile.destroy();
        }
    }

    startGame() {
        // Launch the UI layout when the game starts
        this.scene.stop('Play');
        this.scene.start('GameUI'); 

        // WinnerText and GameOverText
        createTitleText(
            this,
            this.sys.game.scale.width / 2,
            -1000,
            "YOU WIN",
            { fontSize: GAME_CONFIG.FONT.TITLE_SIZE, color: GAME_CONFIG.COLORS.PURPLE }
        ).setName("winnerText").setDepth(3).setInteractive();

        createTitleText(
            this,
            this.sys.game.scale.width / 2,
            -1000,
            "GAME OVER\nClick to restart",
            { fontSize: GAME_CONFIG.FONT.TITLE_SIZE, color: GAME_CONFIG.COLORS.RED }
        )
            .setName("gameOverText")
            .setDepth(3)
            .setInteractive();


        // Start Events

        // Game Logic
    }

}
