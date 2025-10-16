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

    // 🌈 Proper vertical gradient background (top = teal, bottom = soft blue)
    const bg = this.add.graphics();
    // bg.fillGradientStyle(
    //     0x89f7fe, 0x89f7fe, // top-left, top-right
    //     0x66a6ff, 0x66a6ff, // bottom-left, bottom-right
    //     1, 1, 1, 1
    // );
    bg.fillRect(0, 0, width, height);

    // 🎉 Title (playful + bounce)
    const title = this.add.text(width / 2, height / 4, "Mathatro", {
        fontSize: "96px",
        fontFamily: "Poppins, Nunito, Arial, sans-serif",
        fontStyle: "900",
        color: "#ffffff",
        stroke: "#6b46c1",
        strokeThickness: 8,
        shadow: { offsetX: 6, offsetY: 6, color: "#000000", blur: 10, fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
        targets: title,
        scale: { from: 1, to: 1.08 },
        yoyo: true,
        repeat: -1,
        duration: 800,
        ease: "Sine.easeInOut"
    });

    // 🪧 Subheading
    this.add.text(width / 2, height / 3 + 30, "Select Your Difficulty", {
        fontSize: "30px",
        color: "#ffffff",
        fontFamily: "Nunito, Arial, sans-serif",
        fontStyle: "700",
        shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 4, fill: true }
    }).setOrigin(0.5);

    // 🎮 Difficulty buttons
    this.createDifficultyButton("Easy",   height / 2,        "easy");
    this.createDifficultyButton("Medium", height / 2 + 90,   "medium");
    this.createDifficultyButton("Hard",   height / 2 + 180,  "hard");

    // 📖 Instructions
    this.createInstructionsButton();

    // 👤 User Profile (bottom-right)
    this.userProfile = new UserProfile(this);
    this.userProfile.create(width - 120, height - 60);
    }


    private createDifficultyButton(label: string, y: number, mode: DifficultyMode) {
    const { width } = this.sys.game.scale;
    const buttonWidth = 260;
    const buttonHeight = 80;
    const radius = 25;

    const [cTop, cBottom] = ({
        easy:   [0x43e97b, 0x38f9d7],
        medium: [0xf6d365, 0xfda085],
        hard:   [0xf093fb, 0xf5576c],
    } as Record<DifficultyMode, [number, number]>)[mode];

    const btn = this.add.container(width / 2, y);
    btn.setSize(buttonWidth, buttonHeight);

    const g = this.add.graphics();
    g.fillGradientStyle(cTop, cTop, cBottom, cBottom, 1, 1, 1, 1);
    g.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius);

    const txt = this.add.text(0, 0, label, {
        fontSize: "40px",
        color: "#ffffff",
        fontFamily: "Poppins, Nunito, Arial, sans-serif",
        fontStyle: "800",
        align: "center",
        shadow: { offsetX: 3, offsetY: 3, color: "#000000", blur: 6, fill: true }
    }).setOrigin(0.5);

    btn.add([g, txt]);

    // 💡 Use a Zone as the true interactive area
    const zone = this.add.zone(0, 0, buttonWidth, buttonHeight)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

    btn.add(zone);

    // Stable hover / click detection
    zone.on("pointerover", () => this.animateButtonHover(btn, 1.08));
    zone.on("pointerout",  () => this.animateButtonHover(btn, 1.0));
    zone.on("pointerdown", () => {
        this.sound.play("whoosh", { volume: 0.5 });
        this.handleDifficultySelection(mode);
    });
    }

    private animateButtonHover(btn: Phaser.GameObjects.Container, scale: number) {
    this.tweens.add({
        targets: btn,
        scale,
        duration: 150,
        ease: scale > 1 ? "Back.Out" : "Back.In"
    });
    }



    private setupButtonHoverEffects(
    container: Phaser.GameObjects.Container
    ) {
    container.on("pointerover", () => {
        this.tweens.add({
        targets: container,
        scale: 1.08,
        duration: 150,
        ease: "Back.Out"
        });
        // optional hover sound
        // this.sound.play("hover", { volume: 0.2 });
    });

    container.on("pointerout", () => {
        this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 150,
        ease: "Back.In"
        });
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
    const btnX = 130;
    const btnY = 90;
    const btnWidth = 200;
    const btnHeight = 70;
    const btnRadius = 22;

    let isExpanded = false;
    let instructionsPanel: Phaser.GameObjects.Container;

    // 🌈 Gradient colors for the button
    const topColor = 0xf6d365;   // warm yellow
    const bottomColor = 0xfda085; // coral

    // 📦 Create container so hover scaling is smooth
    const buttonContainer = this.add.container(btnX, btnY);
    buttonContainer.setSize(btnWidth, btnHeight);

    // 🎨 Gradient button background
    const btnBg = this.add.graphics();
    btnBg.fillGradientStyle(
        topColor, topColor, bottomColor, bottomColor,
        1, 1, 1, 1
    );
    btnBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, btnRadius);

    // 🧁 Text label
    const btnText = this.add.text(0, 0, '📖 Instructions', {
        fontSize: '22px',
        color: '#ffffff',
        fontFamily: 'Poppins, Nunito, Arial, sans-serif',
        fontStyle: '700',
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
    }).setOrigin(0.5);

    buttonContainer.add([btnBg, btnText]);

    // 💡 Add invisible hit zone (so scaling doesn’t break interactivity)
    const zone = this.add.zone(0, 0, btnWidth, btnHeight)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
    buttonContainer.add(zone);

    // 🎬 Hover effects: grow + shrink
    zone.on('pointerover', () => {
        this.tweens.add({
        targets: buttonContainer,
        scale: 1.1,
        duration: 150,
        ease: 'Back.Out'
        });
    });

    zone.on('pointerout', () => {
        this.tweens.add({
        targets: buttonContainer,
        scale: 1.0,
        duration: 150,
        ease: 'Back.In'
        });
    });

    // 🧭 Create instructions panel (scrollable, hidden initially)
    const createPanel = () => {
        const panelWidth = 380;
        const panelHeight = 530;
        const panelX = 40;
        const panelY = btnY + btnHeight / 2 + 10;

        instructionsPanel = this.add.container(0, 0).setDepth(1000);

        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.2);
        shadow.fillRoundedRect(panelX + 4, panelY + 4, panelWidth, panelHeight, 16);

        const panelBg = this.add.graphics();
        panelBg.fillStyle(0xffffff, 0.98);
        panelBg.lineStyle(3, bottomColor, 1);
        panelBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
        panelBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);

        const title = this.add.text(panelX + panelWidth / 2, panelY + 30, 'How to Play', {
        fontSize: '26px',
        color: '#2d3748',
        fontFamily: 'Nunito',
        fontStyle: '800'
        }).setOrigin(0.5);

        const instructions = [
        '🎯 Goal: Create math expressions to match the target!',
        '',
        '📋 Rules:',
        '  • Use number and operator cards (+, -, ×, ÷)',
        '  • Arrange them to hit the objective',
        '  • Tap Submit when ready',
        '',
        '❤️ Lives:',
        '  • You start with full health',
        '  • Wrong answer → lose a heart',
        '  • Right answer → gain points!',
        '',
        '🎮 Difficulty:',
        '  • Higher levels = trickier numbers',
        '  • More rounds & harder targets!'
        ];

        const text = this.add.text(panelX + 20, panelY + 70, instructions.join('\n'), {
        fontSize: '16px',
        color: '#4a5568',
        fontFamily: 'Nunito',
        lineSpacing: 8,
        wordWrap: { width: panelWidth - 40 }
        }).setOrigin(0, 0);

        // Scroll mask for overflow
        const maskShape = this.add.graphics();
        maskShape.fillRect(panelX + 10, panelY + 60, panelWidth - 20, panelHeight - 70);
        const mask = maskShape.createGeometryMask();
        text.setMask(mask);

        // Scroll wheel support
        this.input.on('wheel', (_pointer, _gameObjects, _dx, dy) => {
        if (!instructionsPanel.visible) return;
        text.y -= dy * 0.5;
        text.y = Phaser.Math.Clamp(text.y, panelY + 70 - 200, panelY + 70);
        });

        instructionsPanel.add([shadow, panelBg, title, text]);
        instructionsPanel.setVisible(false);
    };

    createPanel();

    // 📖 Click → toggle open/close
    zone.on('pointerdown', () => {
        isExpanded = !isExpanded;
        instructionsPanel.setVisible(isExpanded);

        btnText.setText(isExpanded ? '📕 Close' : '📖 Instructions');

        // fun press animation
        this.tweens.add({
        targets: buttonContainer,
        scale: { from: 1, to: 0.95 },
        yoyo: true,
        duration: 100
        });
    });
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
