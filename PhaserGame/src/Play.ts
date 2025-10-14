import Phaser from 'phaser';
import { GAME_CONFIG } from './config/GameConstants';
import { createTitleText, createVolumeButton } from './utils/UIHelpers';
import { GameManager } from './game/GameManager';
import { UserProfile } from './auth/UserProfile';

type DifficultyMode = 'easy' | 'medium' | 'hard';

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

        this.add.text(width / 2, height / 3 + 20, "Select Difficulty", {
            fontSize: "24px",
            color: "#000000",
            fontFamily: GAME_CONFIG.FONT.FAMILY,
            fontStyle: '600'
        }).setOrigin(0.5);

        this.createDifficultyButton("Easy", height / 2, "easy");
        this.createDifficultyButton("Medium", height / 2 + 80, "medium");
        this.createDifficultyButton("Hard", height / 2 + 160, "hard");

        // Create instructions button
        this.createInstructionsButton();

        // Create user profile component at bottom right
        this.userProfile = new UserProfile(this);
        this.userProfile.create(width - 120, height - 60);
    }

    private createDifficultyButton(label: string, y: number, mode: DifficultyMode) {
        const { width } = this.sys.game.scale;
        const buttonWidth = 200;
        const buttonHeight = 60;
        const borderRadius = 15;

        // Create rounded rectangle background
        const bg = this.add.graphics();
        bg.fillStyle(GAME_CONFIG.COLORS.VIBRANT_BLUE, 1);
        bg.fillRoundedRect(width / 2 - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);

        // Create text on top
        const btn = this.add.text(width / 2, y, label, {
            fontSize: "32px",
            color: "#ffffff",
            fontFamily: GAME_CONFIG.FONT.FAMILY,
            fontStyle: '600',
            align: 'center'
        }).setOrigin(0.5);

        // Make interactive
        const hitArea = new Phaser.Geom.Rectangle(
            width / 2 - buttonWidth / 2,
            y - buttonHeight / 2,
            buttonWidth,
            buttonHeight
        );

        bg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
            .setData('bg', true)
            .setData('color', 0x8c7ae6);

        // Add event handlers
        this.setupButtonHoverEffects(bg, width, y, buttonWidth, buttonHeight, borderRadius);
        this.setupButtonClickHandler(bg, mode);

        bg.input!.cursor = 'pointer';
        this.difficultyButtons.push(btn);
    }

    private setupButtonHoverEffects(
        bg: Phaser.GameObjects.Graphics,
        width: number,
        y: number,
        buttonWidth: number,
        buttonHeight: number,
        borderRadius: number
    ) {
        bg.on("pointerover", () => {
            bg.clear();
            bg.fillStyle(GAME_CONFIG.COLORS.DARK_BLUE, 1);
            bg.fillRoundedRect(width / 2 - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        });

        bg.on("pointerout", () => {
            bg.clear();
            bg.fillStyle(GAME_CONFIG.COLORS.VIBRANT_BLUE, 1);
            bg.fillRoundedRect(width / 2 - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        });
    }

    private setupButtonClickHandler(bg: Phaser.GameObjects.Graphics, mode: 'easy' | 'medium' | 'hard') {
        bg.on("pointerdown", () => {
            this.handleDifficultySelection(mode);
        });
    }

    private handleDifficultySelection(mode: 'easy' | 'medium' | 'hard') {
        const state = this.gameManager.getGameState();
        state.setDifficulty(mode);
        state.restartGame();

        this.cleanupDifficultyButtons();
        this.startThemeMusic();
        this.startGameUI();
    }

    private cleanupDifficultyButtons() {
        this.difficultyButtons.forEach(btn => {
            btn.destroy();
            const bgGraphics = this.findButtonBackground();
            if (bgGraphics) {
                bgGraphics.destroy();
            }
        });
    }

    private findButtonBackground(): Phaser.GameObjects.GameObject | undefined {
        return this.children.getChildren().find(child =>
            child.type === 'Graphics' && child.getData('bg')
        );
    }

    private startThemeMusic() {
        if (!this.sound.get("theme-song")) {
            this.sound.play("theme-song", {
                loop: true,
                volume: GAME_CONFIG.AUDIO.THEME_VOLUME
            });
        }
    }

    private startGameUI() {
        this.scene.stop('Play');
        this.scene.start('GameUI');
    }

    createInstructionsButton() {
        const btnX = 100;
        const btnY = 80;
        const btnWidth = 140;
        const btnHeight = 50;
        const btnRadius = 12;

        let isExpanded = false;
        let instructionsPanel: Phaser.GameObjects.Container;
        let panelBg: Phaser.GameObjects.Graphics;

        // Create button background
        const btnBg = this.add.graphics();
        btnBg.fillStyle(GAME_CONFIG.COLORS.WARM_ORANGE, 1);
        btnBg.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, btnRadius);
        btnBg.lineStyle(2, 0xffffff, 0.8);
        btnBg.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, btnRadius);

        // Create button text
        const btnText = this.add.text(btnX, btnY, '📖 Instructions', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: '600',
            fontFamily: GAME_CONFIG.FONT.FAMILY
        }).setOrigin(0.5);

        // Create interactive hit area
        const hitArea = new Phaser.Geom.Rectangle(
            btnX - btnWidth / 2,
            btnY - btnHeight / 2,
            btnWidth,
            btnHeight
        );

        btnBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        // Create instructions panel (initially hidden)
        const createPanel = () => {
            const panelWidth = 380;
            const panelHeight = 480;
            const panelX = 40;
            const panelY = btnY + btnHeight / 2 + 10;

            instructionsPanel = this.add.container(0, 0).setDepth(1000);

            // Panel background
            panelBg = this.add.graphics();
            panelBg.fillStyle(0xffffff, 0.98);
            panelBg.lineStyle(3, GAME_CONFIG.COLORS.WARM_ORANGE, 1);
            panelBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
            panelBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);

            // Shadow
            const shadow = this.add.graphics();
            shadow.fillStyle(0x000000, 0.2);
            shadow.fillRoundedRect(panelX + 3, panelY + 3, panelWidth, panelHeight, 16);
            shadow.setDepth(999);

            // Title
            const title = this.add.text(panelX + panelWidth / 2, panelY + 30, 'How to Play', {
                fontSize: '24px',
                color: '#2d3748',
                fontStyle: '700',
                fontFamily: GAME_CONFIG.FONT.FAMILY
            }).setOrigin(0.5);

            // Instructions text
            const instructions = [
                '🎯 Goal: Create a math expression/number to match the criteria',
                '',
                '📋 Rules:',
                '  • Use cards from your hand',
                '  • Create a math expression',
                '  • Numbers & operators (+, -, *, /)',
                '  • Click Submit when ready',
                '',
                '❤️ Lives: You have limited health',
                '  • Correct answer: +10 points',
                '  • Wrong answer: low health',
                '',
                '🎮 Difficulty affects:',
                '  • Target number range',
                '  • Card complexity',
                '  • Number of rounds'
            ];

            const instructionsText = this.add.text(
                panelX + 20,
                panelY + 70,
                instructions.join('\n'),
                {
                    fontSize: '14px',
                    color: '#4a5568',
                    fontFamily: GAME_CONFIG.FONT.FAMILY,
                    lineSpacing: 8,
                    align: 'left',
                    wordWrap: { width: panelWidth - 40 }
                }
            ).setOrigin(0, 0);

            instructionsPanel.add([shadow, panelBg, title, instructionsText]);
            instructionsPanel.setVisible(false);
        };

        createPanel();

        // Button hover effects
        btnBg.on('pointerover', () => {
            btnBg.clear();
            btnBg.fillStyle(GAME_CONFIG.COLORS.DARK_ORANGE, 1);
            btnBg.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, btnRadius);
            btnBg.lineStyle(2, 0xffffff, 0.8);
            btnBg.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, btnRadius);
        });

        btnBg.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(GAME_CONFIG.COLORS.WARM_ORANGE, 1);
            btnBg.fillRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, btnRadius);
            btnBg.lineStyle(2, 0xffffff, 0.8);
            btnBg.strokeRoundedRect(btnX - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, btnRadius);
        });

        // Toggle panel on click
        btnBg.on('pointerdown', () => {
            isExpanded = !isExpanded;
            instructionsPanel.setVisible(isExpanded);
            btnText.setText(isExpanded ? '📖 Close' : '📖 Instructions');
        });

        btnBg.input!.cursor = 'pointer';
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
