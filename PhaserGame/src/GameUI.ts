import Phaser from 'phaser';
import { createCardSlot } from './createCardSlot';
import { GAME_CONFIG } from './config/GameConstants';
import { createStyledRect, createLabelBox } from './utils/UIHelpers';
import { LayoutManager } from './ui/LayoutManager';
import { GameManager } from './game/GameManager';
import { CardUtils } from './utils/CardUtils';
import { evaluateExpression } from './utils/ExpressionEvaluator';
import { checkObjective } from './utils/ObjectiveChecker';
import { UserProfile } from './auth/UserProfile';
import { FeedbackAnimations } from './utils/FeedbackAnimations';


/**
 * Game UI Scene
 * Handles the user interface elements of the game.
 */
export class GameUI extends Phaser.Scene {
    private gameManager!: GameManager; // set in create()
    private layout: any;
    private rect: any;
    private labelBox: any;
    private sidebar: any;
    private scoreTitle: any;
    private currentScore: any;
    private readonly calcText: any;
    private cumulated: any;
    private healthBarBg: any;
    private healthBarFill: any;
    private readonly healthHint: any;
    private gamesCounter: any;
    private objective: any;
    private objectiveCaption: any;
    private objectiveTestLabel: any;
    private resultBar: any;
    private equalsText: any;
    private handBar: any;
    private handCaption: any;
    private resultContainer: any;
    private handContainer: any;
    private handSlots: any[] = [];
    private resultSlots: any[] = [];
    private winOverlay?: Phaser.GameObjects.Container;
    // Stored handlers for proper cleanup
    private handCardsHandler?: (hand: string[]) => void;
    private gamesProgressHandler?: (data: { current: number; total: number }) => void;
    private gameWonHandler?: () => void;
    private objectiveChangedHandler?: (objective: string) => void;
    private userProfile: UserProfile;
    private feedbackAnimations: FeedbackAnimations;

    constructor() {
        super({ key: 'GameUI' });
    }
    create() {
    this.scene.bringToTop();
    const { width: W, height: H } = this.sys.game.scale;
    this.input.dragDistanceThreshold = GAME_CONFIG.DRAG.DISTANCE_THRESHOLD;

    // Initialize managers
    this.gameManager = GameManager.getInstance();
    this.layout = LayoutManager.calculateCompleteLayout(W, H);

    // Store layout dimensions for easy access
    const { sidebar, healthBar, gamesCounter, objective, resultBar, handBar, testSection } = this.layout;

    // UI helpers - now using centralized utilities
    this.rect = (x: number, y: number, w: number, h: number, options: any = {}) => {
        const {
        fill = GAME_CONFIG.COLORS.GREEN_FELT,
        alpha = GAME_CONFIG.ALPHA.FELT,
        strokeColor = GAME_CONFIG.COLORS.WHITE,
        strokeWidth = 2
        } = options;
        return createStyledRect(this, x, y, w, h, { fill, alpha, strokeColor, strokeWidth });
    };

    this.labelBox = (x: number, y: number, w: number, h: number, text: string, options: any = {}) => {
        return createLabelBox(this, x, y, w, h, text, options);
    };

    // Sidebar / Scoreboard
    this.sidebar = this.rect(sidebar.x, sidebar.y, sidebar.width, sidebar.height, {
        fill: GAME_CONFIG.COLORS.DEEP_PURPLE,
        alpha: 0.85,
        radius: 12,
        strokeColor: 0xffffff,
        strokeWidth: 2
    });

    this.scoreTitle = this.add.text(sidebar.scoreTitleX, sidebar.scoreTitleY, 'Score Board', {
        fontSize: GAME_CONFIG.FONT.SCORE_SIZE + 2,
        color: '#ffffff',
        fontStyle: '600',
        fontFamily: GAME_CONFIG.FONT.FAMILY
    }).setOrigin(0.5);

    this.currentScore = this.labelBox(
        sidebar.currentScoreX,
        sidebar.currentScoreY,
        sidebar.currentScoreWidth,
        sidebar.currentScoreHeight,
        'current game score'
    );

    // Health bar
    this.add.text(healthBar.backgroundX, healthBar.backgroundY - 25, 'Health bar', {
        fontSize: '18px',
        color: '#000000',
        fontStyle: '500',
        fontFamily: GAME_CONFIG.FONT.FAMILY
    }).setOrigin(0, 0);

    this.healthBarBg = this.rect(healthBar.backgroundX, healthBar.backgroundY, healthBar.backgroundWidth, healthBar.backgroundHeight, {
        fill: GAME_CONFIG.COLORS.LIGHT_BG,
        alpha: 0.8,
        radius: 8,
        strokeColor: 0xffffff,
        strokeWidth: 2
    });

    this.healthBarFill = this.add.graphics();
    this.healthBarFill.fillStyle(0x48bb78, GAME_CONFIG.ALPHA.HEALTH_FILL);
    this.healthBarFill.fillRoundedRect(healthBar.fillX, healthBar.fillY, healthBar.fillWidth, healthBar.fillHeight, 7);
    this.healthBarFill.setData('maxWidth', healthBar.fillWidth);
    this.healthBarFill.setData('x', healthBar.fillX);
    this.healthBarFill.setData('y', healthBar.fillY);
    this.healthBarFill.setData('height', healthBar.fillHeight);

    const state = this.gameManager.getGameState();

    // Event listeners
    this.handCardsHandler = (hand: string[]) => this.updateHand(hand);
    state.onGameEvent('handCardsChanged', this.handCardsHandler);

    this.gamesProgressHandler = ({ current, total }) => this.setGames(`Round: ${current} / ${total}`);
    state.onGameEvent('gamesProgressChanged', this.gamesProgressHandler);

    this.gameWonHandler = () => this.showWinOverlay();
    state.onGameEvent('gameWon', this.gameWonHandler);

    this.gamesCounter = this.labelBox(
        gamesCounter.x,
        gamesCounter.y,
        gamesCounter.width,
        gamesCounter.height,
        `Round: ${state.gamesPlayed} / ${state.maxGames}`,
        { radius: 12 }
    );

    this.objectiveChangedHandler = (objective: string) => this.setObjective(objective);
    state.onGameEvent('objectiveChanged', this.objectiveChangedHandler);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        const stateRef = this.gameManager.getGameState();
        if (this.handCardsHandler) stateRef.offGameEvent('handCardsChanged', this.handCardsHandler);
        if (this.gamesProgressHandler) stateRef.offGameEvent('gamesProgressChanged', this.gamesProgressHandler);
        if (this.gameWonHandler) stateRef.offGameEvent('gameWon', this.gameWonHandler);
        if (this.objectiveChangedHandler) stateRef.offGameEvent('objectiveChanged', this.objectiveChangedHandler);
    });

    // Objective
    this.objective = this.labelBox(
        objective.x,
        objective.y,
        objective.width,
        objective.height,
        GAME_CONFIG.LAYOUT.DEFAULT_OBJECTIVE_TEXT,
        { fontSize: GAME_CONFIG.FONT.OBJECTIVE_SIZE, fontStyle: 'bold', radius: 12 }
    );

    this.objectiveCaption = this.add.text(
        objective.captionX,
        objective.captionY,
        'Objective',
        { fontSize: '20px', color: '#000000', fontStyle: 'bold' }
    ).setOrigin(0.5, 1);

    // Test Section (temporary)
    this.objectiveTestLabel = this.add.text(testSection.x, testSection.y, 'Test Objective', {
        fontSize: GAME_CONFIG.FONT.SCORE_SIZE,
        color: GAME_CONFIG.COLORS.WHITE,
        fontStyle: 'bold'
    });
    this.objectiveTestLabel.setAlpha(GAME_CONFIG.LAYOUT.DEFAULT_ALPHA);
    this.objectiveTestLabel.setInteractive();
    this.objectiveTestLabel.on(Phaser.Input.Events.POINTER_DOWN, () => {
        const newObjective = this.gameManager.generateObjective();
        this.gameManager.setObjective(newObjective);
    });

    // Result slots
    this.resultBar = this.rect(resultBar.x, resultBar.y, resultBar.width, resultBar.height, {
        fill: GAME_CONFIG.COLORS.LIGHT_BG,
        alpha: 0.75,
        radius: 12,
        strokeColor: 0xffffff,
        strokeWidth: 2
    });

    this.equalsText = this.add.text(resultBar.equalsX, resultBar.equalsY, '= ', {
        fontSize: GAME_CONFIG.LAYOUT.RESULT_EQUALS_FONT_SIZE,
        color: '#4a5568',
        fontStyle: '700',
        fontFamily: GAME_CONFIG.FONT.FAMILY
    });

    // Hand bar
    this.handBar = this.rect(handBar.x, handBar.y, handBar.width, handBar.height, {
        fill: GAME_CONFIG.COLORS.MEDIUM_BG,
        alpha: 0.8,
        radius: 12,
        strokeColor: 0xffffff,
        strokeWidth: 2
    });

    this.handCaption = this.add.text(handBar.captionX, handBar.captionY, 'Cards, either operator(+,-,*,/) or number (0–9)', {
        fontSize: GAME_CONFIG.FONT.CAPTION_SIZE,
        color: '#4a5568',
        fontStyle: '500',
        fontFamily: GAME_CONFIG.FONT.FAMILY
    }).setOrigin(0.5, 0);

    // Containers for visuals
    this.resultContainer = this.add.container(0, 0).setDepth(GAME_CONFIG.DRAG.DEPTH + 2);
    this.handContainer = this.add.container(0, 0).setDepth(GAME_CONFIG.DRAG.DEPTH + 2);

    // Initialize defaults
    this.setHealth(GAME_CONFIG.HEALTH_FULL);
    const currentObjective = this.gameManager.getCurrentObjective();
    this.setObjective(currentObjective || GAME_CONFIG.LAYOUT.DEFAULT_OBJECTIVE_TEXT);
    this.setScore(GAME_CONFIG.DEFAULT_SCORE);
    this.createHandSlots(GAME_CONFIG.HAND_SLOTS);
    this.updateHand(this.gameManager.getGameState().handCards);
    this.createResultSlots(GAME_CONFIG.RESULT_SLOTS);
    this.updateResultSlots(['?', '?', '?', '?', '?', '?']);

    // 🌈 Submit Button (consistent with new UI style)
    const submitBtnWidth = 220;
    const submitBtnHeight = 60;
    const submitBtnRadius = 18;
    const submitBtnX = this.sys.game.scale.width / 2;
    const submitBtnY = this.sys.game.scale.height - 160;

    const submitBtnContainer = this.add.container(submitBtnX, submitBtnY);
    submitBtnContainer.setSize(submitBtnWidth, submitBtnHeight);

    const submitBtnBg = this.add.graphics();
    submitBtnBg.fillGradientStyle(0x89f7fe, 0x89f7fe, 0x66a6ff, 0x66a6ff, 1, 1, 1, 1);
    submitBtnBg.fillRoundedRect(-submitBtnWidth / 2, -submitBtnHeight / 2, submitBtnWidth, submitBtnHeight, submitBtnRadius);

    const submitBtnText = this.add.text(0, 0, "Submit", {
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "700",
        fontFamily: "Poppins, Nunito, Arial, sans-serif",
        shadow: { offsetX: 3, offsetY: 3, color: "#000000", blur: 6, fill: true }
    }).setOrigin(0.5);

    submitBtnContainer.add([submitBtnBg, submitBtnText]);

    const submitHitArea = this.add.zone(0, 0, submitBtnWidth, submitBtnHeight)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
    submitBtnContainer.add(submitHitArea);

    submitHitArea.on("pointerover", () => {
        this.tweens.add({ targets: submitBtnContainer, scale: 1.08, duration: 150, ease: "Back.Out" });
    });

    submitHitArea.on("pointerout", () => {
        this.tweens.add({ targets: submitBtnContainer, scale: 1.0, duration: 150, ease: "Back.In" });
    });

    submitHitArea.on("pointerdown", () => {
        this.sound?.play("whoosh", { volume: 0.4 });
        this.tweens.add({ targets: submitBtnContainer, scale: 0.95, duration: 100, yoyo: true, ease: "Back.InOut" });
    });

    submitHitArea.on("pointerup", () => {
        console.log("Submit clicked ✅");
        const cards = this.resultSlots
        .map(slot => slot.card?.list?.[2]?.text ?? "")
        .filter(label => label !== "");
        if (cards.length === 0) return;

        const result = evaluateExpression(cards);
        const isCorrect = checkObjective(result, this.gameManager.getCurrentObjective());

        if (isCorrect) {
        this.feedbackAnimations.showCorrectFeedback();
        this.gameManager.updateScore(10);
        const stateBefore = this.gameManager.getGameState();
        stateBefore.advanceRound();
        this.updateHand(stateBefore.handCards);
        this.resetResultSlots();
        } else {
        this.feedbackAnimations.showIncorrectFeedback();
        this.gameManager.updateLives(-1);
        this.gameManager.updateLives(-1);
        if (this.gameManager.getGameState().lives <= 0) {
            this.showGameOverOverlay();
            return;
        }
        }
    });

    // User profile + feedback
    this.userProfile = new UserProfile(this);
    this.userProfile.create(W - 120, H - 60);
    this.feedbackAnimations = new FeedbackAnimations(this);

    // Switch Difficulty
    this.createSwitchDifficultyButton(W, H);
    this.createDragEvents();
    }


    private showGameOverOverlay() {
    const { width: W, height: H } = this.sys.game.scale;
    const overlay = this.add.container(0, 0).setDepth(5000);

    const maskBg = this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0, 0).setInteractive();
    overlay.add(maskBg);

    const panel = this.add.rectangle(W / 2 - 240, H / 2 - 130, 480, 260, 0xffffff, 0.92)
        .setOrigin(0, 0)
        .setStrokeStyle(4, 0xfc8181);
    overlay.add(panel);

    const title = this.add.text(W / 2, H / 2 - 20, 'GAME OVER', {
        fontSize: '48px',
        color: '#fc8181',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    overlay.add(title);

    const homeBtn = this.add.text(W / 2, H / 2 + 60, 'Return Home', {
        fontSize: '28px',
        color: '#ffffff',
        backgroundColor: '#fc8181',
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    overlay.add(homeBtn);

    homeBtn.on('pointerover', () => homeBtn.setStyle({ backgroundColor: '#ff9c9c' }));
    homeBtn.on('pointerout', () => homeBtn.setStyle({ backgroundColor: '#fc8181' }));

    homeBtn.on('pointerdown', () => {
        this.scene.stop('GameUI');
        this.scene.start('Play');
    });
    }


    setHealth(ratio: number) {
        const r = Phaser.Math.Clamp(ratio, 0, 1);
        const maxWidth = this.healthBarFill.getData('maxWidth');
        const currentWidth = Math.max(0, maxWidth * r);

        // Determine health bar color based on ratio
        let healthColor = 0xf6ad55; // Amber
        if (r > GAME_CONFIG.HEALTH_WARNING) {
            healthColor = 0x48bb78; // Fresh Green
        }
        if (r <= GAME_CONFIG.HEALTH_CRITICAL) {
            healthColor = 0xfc8181; // Coral Red
        }

        // Redraw the health bar fill with rounded corners
        this.healthBarFill.clear();
        this.healthBarFill.fillStyle(healthColor, GAME_CONFIG.ALPHA.HEALTH_FILL);
        this.healthBarFill.fillRoundedRect(
            this.healthBarFill.getData('x'),
            this.healthBarFill.getData('y'),
            currentWidth,
            this.healthBarFill.getData('height'),
            7
        );
    }
    setGames(txt: string) {
        this.gamesCounter?.text?.setText(txt);
    }
    setObjective(txt: string) {
        this.objective.text.setText(txt);
    }
    setScore(val: number | string) {
        this.currentScore.text.setText(String(val));
    }
    createHandSlots(count: number) {
        // Use LayoutManager for positioning calculations
        const slotLayout = LayoutManager.calculateHandSlotPositions(this.handBar.width, this.handBar.height, count);

        this.handSlots = [];
        for (let i = 0; i < count; i++) {
            const position = slotLayout.positions[i];
            const slot = createCardSlot(this, this.handBar.x + position.x, this.handBar.y + position.y, slotLayout.cardWidth, slotLayout.cardHeight, {});
            this.handSlots.push(slot);
            this.handContainer.add(slot);
        }
    }
    updateHand(items: any[] = []) {
        // Use CardUtils to eliminate duplication
        CardUtils.updateCardsInSlots(this, this.handSlots, items);

        // Attach listeners to all cards
        this.handSlots.forEach(slot => {
            if (slot.card) {
                slot.card.slot = slot; // link card to its slot
                this.handContainer.add(slot.card);
                this.attachCardPointerListeners(slot.card);
            }
        });
    }
    createResultSlots(count: number) {
        // Use LayoutManager for positioning calculations
        const slotLayout = LayoutManager.calculateResultSlotPositions(this.resultBar.width, this.resultBar.height, count);

        this.resultSlots = [];
        for (let i = 0; i < count; i++) {
            const position = slotLayout.positions[i];
            const slot = createCardSlot(this, this.resultBar.x + position.x, this.resultBar.y + position.y, slotLayout.cardWidth, slotLayout.cardHeight, {});
            this.resultSlots.push(slot);
            this.resultContainer.add(slot);
        }
    }
    updateResultSlots(items: any[] = []) {
        // Use CardUtils to eliminate duplication
        CardUtils.updateCardsInSlots(this, this.resultSlots, items);

        // Attach listeners to all cards
        this.resultSlots.forEach(slot => {
            if (slot.card) {
                slot.card.slot = slot; // link card to its slot
                this.resultContainer.add(slot.card);
                this.attachCardPointerListeners(slot.card);
            }
        });

        // Update the result display
        this.updateResultDisplay();
    }

    // Update the equals text to show calculated result
    updateResultDisplay() {
        // Collect cards from result slots
        const cards = this.resultSlots
            .map(slot => slot.card?.list?.[2]?.text ?? "")
            .filter(label => label !== "" && label !== "?");

        if (cards.length === 0) {
            this.equalsText.setText('= ');
            return;
        }

        try {
            const result = evaluateExpression(cards);
            if (result !== null && !isNaN(result)) {
                this.equalsText.setText(`= ${result}`);
            }
        } catch (error) {
            // Keep previous display if expression is invalid
            console.debug('Expression evaluation failed:', error);
        }
    }

    // Create drag events to allow card movement
    createDragEvents() {
        this.createCardDragStartEventListener();
        this.createCardDragHoldEventListener();
        this.createCardDragEndEventListener();
    }

    createCardDragStartEventListener() {
        this.input.on(Phaser.Input.Events.DRAG_START, (pointer: Phaser.Input.Pointer, gameObject: any) => {
            gameObject.setAlpha(GAME_CONFIG.ALPHA.DRAGGING);
            gameObject.parentContainer?.bringToTop(gameObject);
            gameObject.shadow?.setAlpha(GAME_CONFIG.ALPHA.CARD_SHADOW);

            gameObject.setDepth(GAME_CONFIG.DRAG.DEPTH);
        });
    }

    createCardDragHoldEventListener() {
        this.input.on(Phaser.Input.Events.DRAG, (pointer: Phaser.Input.Pointer, gameObject: any, cursorDragX: number, cursorDragY: number) => {
            gameObject.setPosition(cursorDragX, cursorDragY)
        });
    }

    createCardDragEndEventListener() {
        this.input.on(Phaser.Input.Events.DRAG_END, (pointer: Phaser.Input.Pointer, gameObject: any) => {
            gameObject.setAlpha(1);
            gameObject.shadow?.setAlpha(1);
            gameObject.setDepth(0);

            // Check both handSlots and resultSlots for hovered slot
            const allSlots = [...this.handSlots, ...(this.resultSlots || [])];
            const hoveredSlot = allSlots.find(slot => slot.isPointerOver(pointer));

            // return card to slot if not hovering over anything
            if (!hoveredSlot) {
                if (gameObject.slot) {
                    gameObject.slot.setCard(gameObject);
                }
                return;
            }

            if (hoveredSlot.card && hoveredSlot.card !== gameObject) {
                // swap cards around if hovering over different card
                const oldSlot = gameObject.slot;
                const replacedCard = hoveredSlot.card;

                hoveredSlot.setCard(gameObject);

                if (oldSlot) {
                    oldSlot.setCard(replacedCard);
                }

            } else {
                // if hovering over original slot, snap it back or move to empty slot
                hoveredSlot.setCard(gameObject)
            }

            // Update result display after card movement
            this.updateResultDisplay();
        });
    }

        // Attach pointer listeners to a card container for click/drag logic
    attachCardPointerListeners(card: any) {
        // Make card interactive
        card.setInteractive({ useHandCursor: true });

        // orce pointer cursor on hover (
        card.on('pointerover', function (this: any) {
            this.scene.input.setDefaultCursor('pointer');
        });
        card.on('pointerout', function (this: any) {
            this.scene.input.setDefaultCursor('default');
        });

        // Keep your click/drag logic
        card.on('pointerdown', function (this: any, pointer: Phaser.Input.Pointer) {
            this._wasDrag = false;
        });
        card.on('dragstart', function (this: any, pointer: Phaser.Input.Pointer) {
            this._wasDrag = true;
        });
        card.on('pointerup', function (this: any, pointer: Phaser.Input.Pointer) {
            if (!this._wasDrag) {
                const scene: any = this.scene;
                if (scene.handSlots?.includes(this.slot)) {
                    const emptyResultSlot = scene.resultSlots?.find((s: any) => !s.card);
                    if (emptyResultSlot) {
                        emptyResultSlot.setCard(this);
                        scene.updateResultDisplay();
                    }
                } else if (scene.resultSlots?.includes(this.slot)) {
                    const emptyHandSlot = scene.handSlots?.find((s: any) => !s.card);
                    if (emptyHandSlot) {
                        emptyHandSlot.setCard(this);
                        scene.updateResultDisplay();
                    }
                }
            }
        });
    }

    // Reset result slots to '?' placeholders for the next round
    resetResultSlots() {
        const placeholders = Array(GAME_CONFIG.RESULT_SLOTS).fill('?');
        this.updateResultSlots(placeholders);
    }

    // 🟠 Gradient "Switch Difficulty" Button — matches new UI style
    createSwitchDifficultyButton(gameWidth: number, gameHeight: number) {
    const btnWidth = 220;
    const btnHeight = 60;
    const btnRadius = 18;
    const btnX = gameWidth / 2;
    const btnY = gameHeight - 80;

    // Container to group graphics + text
    const btnContainer = this.add.container(btnX, btnY);
    btnContainer.setSize(btnWidth, btnHeight);

    // Gradient background
    const btnBg = this.add.graphics();
    btnBg.fillGradientStyle(0xf6d365, 0xf6d365, 0xfda085, 0xfda085, 1, 1, 1, 1);
    btnBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, btnRadius);

    // Text
    const btnText = this.add.text(0, 0, 'Switch Difficulty', {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: '700',
        fontFamily: 'Poppins, Nunito, Arial, sans-serif',
        shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
        }
    }).setOrigin(0.5);

    btnContainer.add([btnBg, btnText]);

    // Interactive zone
    const zone = this.add.zone(0, 0, btnWidth, btnHeight).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btnContainer.add(zone);

    // Hover animation
    zone.on('pointerover', () => {
        this.tweens.add({ targets: btnContainer, scale: 1.08, duration: 150, ease: 'Back.Out' });
    });
    zone.on('pointerout', () => {
        this.tweens.add({ targets: btnContainer, scale: 1.0, duration: 150, ease: 'Back.In' });
    });

    // Click bounce animation + action
    zone.on('pointerdown', () => {
        this.sound?.play('whoosh', { volume: 0.4 });
        this.tweens.add({ targets: btnContainer, scale: 0.95, duration: 100, yoyo: true, ease: 'Back.InOut' });
    });

    zone.on('pointerup', () => {
        this.scene.stop('GameUI');
        this.scene.start('Play');
    });
    }


    // Display a win overlay with a button to go back to home (Play) scene
    private showWinOverlay() {
        if (this.winOverlay) {
            this.winOverlay.destroy();
        }

        const { width: W, height: H } = this.sys.game.scale;
        const overlay = this.add.container(0, 0).setDepth(5000);

        const maskBg = this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0, 0).setInteractive();
        overlay.add(maskBg);

        const panelWidth = 480;
        const panelHeight = 260;
        const panelX = (W - panelWidth) / 2;
        const panelY = (H - panelHeight) / 2;
        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0xffffff, 0.92)
            .setOrigin(0, 0)
            .setStrokeStyle(4, 0x8c7ae6, 1);
        overlay.add(panel);

        const title = this.add.text(panelX + panelWidth / 2, panelY + 60, 'YOU WIN!', {
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#8c7ae6',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5);
        overlay.add(title);

        const summary = this.add.text(panelX + panelWidth / 2, panelY + 120,
            'Great job completing all rounds!', {
            fontSize: '20px',
            color: '#333',
            align: 'center',
            wordWrap: { width: panelWidth - 60 }
        }).setOrigin(0.5);
        overlay.add(summary);

        const homeBtn = this.add.text(panelX + panelWidth / 2, panelY + panelHeight - 60, 'Return Home', {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff',
            backgroundColor: '#8c7ae6',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        overlay.add(homeBtn);

        homeBtn.on('pointerover', () => homeBtn.setStyle({ backgroundColor: '#9c88ff' }));
        homeBtn.on('pointerout', () => homeBtn.setStyle({ backgroundColor: '#8c7ae6' }));
        let hasReturned = false;
        let autoReturnTimer: Phaser.Time.TimerEvent | null = null;

        const returnHome = () => {
            if (hasReturned) return; // idempotent
            hasReturned = true;
            if (autoReturnTimer) {
                autoReturnTimer.remove(false);
                autoReturnTimer = null;
            }
            this.winOverlay?.destroy();
            this.winOverlay = undefined;
            // Stop GameUI and go back to Play; Play scene re-initializes difficulty selection UI
            if (this.scene.isActive('GameUI')) {
                this.scene.stop('GameUI');
            }
            if (this.scene.isActive('Play')) {
                // Already active: just ensure it is brought to top
                this.scene.bringToTop('Play');
            } else {
                this.scene.start('Play');
            }
        };

        homeBtn.on('pointerdown', returnHome);

        // Auto-return after delay for smoother flow (optional)
        autoReturnTimer = this.time.delayedCall(4000, () => {
            if (!hasReturned) {
                returnHome();
            }
        });

        this.winOverlay = overlay;
    }
}