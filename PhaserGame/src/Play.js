import Phaser from 'phaser';
import { GAME_CONFIG } from './config/GameConstants';
import { createTitleText, createAnimatedTitle, createVolumeButton } from './utils/UIHelpers';

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
    // All cards names
    cardNames = ["card-0", "card-1", "card-2", "card-3", "card-4", "card-5"];
    // Cards Game Objects
    cards = [];

    // Game variables
    lives = 0;


    constructor() {
        super({
            key: 'Play'
        });
    }

    init() {
        // Fadein camera
        this.cameras.main.fadeIn(GAME_CONFIG.ANIMATION.FADE_DURATION);
        this.createVolumeButton();
    }

    create() {
        // Create animated title using utility function
        createAnimatedTitle(
            this,
            this.sys.game.scale.width / 2,
            this.sys.game.scale.height / 2,
            "Maths Card Game\nClick to Play",
            () => {
                if (!this.sound.get("theme-song")) {
                    this.sound.play("theme-song", { loop: true, volume: GAME_CONFIG.AUDIO.THEME_VOLUME });
                }
                this.startGame();
            }
        );
    }

    restartGame() {
        //TODO implement  method
    }

    createVolumeButton() {
        return createVolumeButton(this);
    }

    startGame() {
        // Launch the UI layout when the game starts
        this.scene.launch('GameUI');

        // WinnerText and GameOverText
        createTitleText(
            this,
            this.sys.game.scale.width / 2,
            -1000,
            "YOU WIN",
            { fontSize: GAME_CONFIG.FONT.TITLE_SIZE, color: GAME_CONFIG.COLORS.PURPLE }
        ).setDepth(3).setInteractive();

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
