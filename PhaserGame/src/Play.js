import Phaser from 'phaser';
import { GAME_CONFIG } from './config/GameConstants';

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
        //prob belongs in ui
        const titleText = this.add.text(this.sys.game.scale.width / 2, this.sys.game.scale.height / 2,
            "Maths Card Game\nClick to Play",
            {
                align: "center",
                strokeThickness: GAME_CONFIG.FONT.STROKE_THICKNESS,
                fontSize: GAME_CONFIG.FONT.TITLE_SIZE,
                fontStyle: "bold",
                color: GAME_CONFIG.COLORS.PURPLE
            }
        )
            .setOrigin(.5)
            .setDepth(3)
            .setInteractive();
        // title tween like retro arcade
        this.add.tween({
            targets: titleText,
            duration: GAME_CONFIG.ANIMATION.TWEEN_DURATION,
            ease: (value) => (value > .8),
            alpha: 0,
            repeat: -1,
            yoyo: true,
        });

        // Text Events
        titleText.on(Phaser.Input.Events.POINTER_OVER, () => {
            titleText.setColor(GAME_CONFIG.COLORS.LIGHT_PURPLE);
            this.input.setDefaultCursor("pointer");
        });
        titleText.on(Phaser.Input.Events.POINTER_OUT, () => {
            titleText.setColor(GAME_CONFIG.COLORS.PURPLE);
            this.input.setDefaultCursor("default");
        });
        titleText.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.sound.play("whoosh", { volume: GAME_CONFIG.AUDIO.WHOOSH_VOLUME });
            this.add.tween({
                targets: titleText,
                ease: Phaser.Math.Easing[GAME_CONFIG.ANIMATION.BOUNCE_EASING],
                y: -1000,
                onComplete: () => {
                    if (!this.sound.get("theme-song")) {
                        this.sound.play("theme-song", { loop: true, volume: GAME_CONFIG.AUDIO.THEME_VOLUME });
                    }
                    this.startGame();
                }
            })
        });
    }

    restartGame() {
        //TODO implement  method
    }

    createVolumeButton() {
        const volumeIcon = this.add.image(25, 25, "volume-icon").setName("volume-icon");
        volumeIcon.setInteractive();

        // Mouse enter
        volumeIcon.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.input.setDefaultCursor("pointer");
        });
        // Mouse leave
        volumeIcon.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.input.setDefaultCursor("default");
        });

        volumeIcon.on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this.sound.volume === 0) {
                this.sound.setVolume(1);
                volumeIcon.setTexture("volume-icon");
                volumeIcon.setAlpha(1);
            } else {
                this.sound.setVolume(0);
                volumeIcon.setTexture("volume-icon_off");
                volumeIcon.setAlpha(GAME_CONFIG.ALPHA.VOLUME_OFF)
            }
        });
    }

    startGame() {
        // Launch the UI layout when the game starts
        this.scene.launch('GameUI');

        // WinnerText and GameOverText
        const winnerText = this.add.text(this.sys.game.scale.width / 2, -1000, "YOU WIN",
            {
                align: "center",
                strokeThickness: GAME_CONFIG.FONT.STROKE_THICKNESS,
                fontSize: GAME_CONFIG.FONT.TITLE_SIZE,
                fontStyle: "bold",
                color: GAME_CONFIG.COLORS.PURPLE
            }
        ).setOrigin(.5)
            .setDepth(3)
            .setInteractive();

        const gameOverText = this.add.text(this.sys.game.scale.width / 2, -1000,
            "GAME OVER\nClick to restart",
            {
                align: "center",
                strokeThickness: GAME_CONFIG.FONT.STROKE_THICKNESS,
                fontSize: GAME_CONFIG.FONT.TITLE_SIZE,
                fontStyle: "bold",
                color: GAME_CONFIG.COLORS.RED
            }
        )
            .setName("gameOverText")
            .setDepth(3)
            .setOrigin(.5)
            .setInteractive();


        // Start Events

        // Game Logic
    }

}
