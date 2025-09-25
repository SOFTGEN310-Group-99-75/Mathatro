import Phaser from 'phaser';
import { createCardSlot } from './createCardSlot';
import { GAME_CONFIG } from './config/GameConstants';
import { createStyledRect, createLabelBox } from './utils/UIHelpers';
import { LayoutManager } from './ui/LayoutManager';
import { GameManager } from './game/GameManager';
import { CardUtils } from './utils/CardUtils';
import { evaluateExpression } from './utils/ExpressionEvaluator';
import { checkObjective } from './utils/ObjectiveChecker';

/**
 * Game UI Scene
 * Handles the user interface elements of the game.
 */
export class GameUI extends Phaser.Scene {
    private gameManager: GameManager;
    private layout: any;
    private rect: any;
    private labelBox: any;
    private sidebar: any;
    private scoreTitle: any;
    private currentScore: any;
    private calcText: any;
    private cumulated: any;
    private healthBarBg: any;
    private healthBarFill: any;
    private healthHint: any;
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
    private handSlots: any[];
    private resultSlots: any[];

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

        // Score Board panel - using LayoutManager
        this.sidebar = this.rect(sidebar.x, sidebar.y, sidebar.width, sidebar.height, { fill: GAME_CONFIG.COLORS.BLACK, alpha: GAME_CONFIG.ALPHA.SIDEBAR });
        this.scoreTitle = this.add.text(sidebar.scoreTitleX, sidebar.scoreTitleY, 'Score Board', { fontSize: GAME_CONFIG.FONT.SCORE_SIZE + 2, color: GAME_CONFIG.COLORS.BLACK }).setOrigin(0.5);
        this.currentScore = this.labelBox(sidebar.currentScoreX, sidebar.currentScoreY, sidebar.currentScoreWidth, sidebar.currentScoreHeight, 'current game score');
        this.calcText = this.add.text(sidebar.calcTextX, sidebar.calcTextY, 'calculations?\nmayber multipliers or smth else', { fontSize: GAME_CONFIG.FONT.CAPTION_SIZE, color: GAME_CONFIG.COLORS.DARK_GRAY, wordWrap: { width: sidebar.width - GAME_CONFIG.LAYOUT.CALC_TEXT_WIDTH_OFFSET } });
        this.cumulated = this.labelBox(sidebar.cumulatedX, sidebar.cumulatedY, sidebar.cumulatedWidth, sidebar.cumulatedHeight, 'Cumulated score (previous game)\nvs\nScore needed to pass the level', { fontSize: GAME_CONFIG.FONT.CAPTION_SIZE });

        // Health bar + Games counter - using LayoutManager
        this.healthBarBg = this.rect(healthBar.backgroundX, healthBar.backgroundY, healthBar.backgroundWidth, healthBar.backgroundHeight, { fill: GAME_CONFIG.COLORS.RED, alpha: GAME_CONFIG.ALPHA.HEALTH_BG });
        this.healthBarFill = this.add.rectangle(healthBar.fillX, healthBar.fillY, healthBar.fillWidth, healthBar.fillHeight, GAME_CONFIG.COLORS.GREEN, GAME_CONFIG.ALPHA.HEALTH_FILL).setOrigin(0, 0);
        this.healthHint = this.add.text(this.healthBarBg.x, this.healthBarBg.y - GAME_CONFIG.LAYOUT.HEALTH_HINT_Y_OFFSET, 'Health bar\n(deduct health if objective is impossible for current hand)', { fontSize: GAME_CONFIG.FONT.HINT_SIZE, color: GAME_CONFIG.COLORS.MEDIUM_GRAY }).setOrigin(0, 1);
        this.gamesCounter = this.labelBox(gamesCounter.x, gamesCounter.y, gamesCounter.width, gamesCounter.height, GAME_CONFIG.LAYOUT.DEFAULT_GAME_TEXT);

        // Objective label - using LayoutManager
        this.objective = this.labelBox(objective.x, objective.y, objective.width, objective.height, GAME_CONFIG.LAYOUT.DEFAULT_OBJECTIVE_TEXT, { fontSize: GAME_CONFIG.FONT.OBJECTIVE_SIZE, fontStyle: 'bold' });
        this.objectiveCaption = this.add.text(objective.captionX, objective.captionY, 'Objective', { fontSize: GAME_CONFIG.FONT.HINT_SIZE, color: GAME_CONFIG.COLORS.MEDIUM_GRAY }).setOrigin(0.5, 1);


        // -------------- Test Section remove any time - using LayoutManager
        this.objectiveTestLabel = this.add.text(testSection.x, testSection.y, 'Test Objective', {
            fontSize: GAME_CONFIG.FONT.SCORE_SIZE,
            color: GAME_CONFIG.COLORS.WHITE,
            fontStyle: 'bold',
        });
        this.objectiveTestLabel.setAlpha(GAME_CONFIG.LAYOUT.DEFAULT_ALPHA);
        this.objectiveTestLabel.setInteractive();
        // when label box is clicked, call generateObjective
        this.objectiveTestLabel.on(Phaser.Input.Events.POINTER_DOWN, () => {
            const newObjective = this.gameManager.generateObjective();
            this.gameManager.setObjective(newObjective);
        });
        // -----------------------------------------

        // Result slots - using LayoutManager
        this.resultBar = this.rect(resultBar.x, resultBar.y, resultBar.width, resultBar.height, { fill: GAME_CONFIG.COLORS.BLACK, alpha: GAME_CONFIG.ALPHA.RESULT_BAR });
        this.equalsText = this.add.text(resultBar.equalsX, resultBar.equalsY, '=  ?', { fontSize: GAME_CONFIG.LAYOUT.RESULT_EQUALS_FONT_SIZE, color: GAME_CONFIG.COLORS.BLACK });

        // Hand bar - using LayoutManager
        this.handBar = this.rect(handBar.x, handBar.y, handBar.width, handBar.height, { fill: GAME_CONFIG.COLORS.BLACK, alpha: GAME_CONFIG.ALPHA.HAND_BAR });
        this.handCaption = this.add.text(handBar.captionX, handBar.captionY, 'Cards, either operator(+,-,*,/) or number (0–9)', { fontSize: GAME_CONFIG.FONT.CAPTION_SIZE, color: GAME_CONFIG.COLORS.MEDIUM_GRAY }).setOrigin(0.5, 0);


        // Containers for dynamic visuals
        this.resultContainer = this.add.container(0, 0).setDepth(GAME_CONFIG.DRAG.DEPTH + 2);
        this.handContainer = this.add.container(0, 0).setDepth(GAME_CONFIG.DRAG.DEPTH + 2);

        // Initialize with defaults
        this.setHealth(GAME_CONFIG.HEALTH_FULL);
        this.setGames(GAME_CONFIG.LAYOUT.DEFAULT_GAME_TEXT);
        // Initialize with current objective from game manager
        const currentObjective = this.gameManager.getCurrentObjective();
        this.setObjective(currentObjective || GAME_CONFIG.LAYOUT.DEFAULT_OBJECTIVE_TEXT);
        this.setScore(GAME_CONFIG.DEFAULT_SCORE);
        this.createHandSlots(GAME_CONFIG.HAND_SLOTS);
        // initial paint from state
        this.updateHand(this.gameManager.getGameState().handCards);

        // keep UI in sync when a new hand is generated
        this.gameManager.getGameState().onGameEvent('handCardsChanged', (hand: string[]) => {
        this.updateHand(hand);
        });
        this.createResultSlots(GAME_CONFIG.RESULT_SLOTS);
        this.updateResultSlots(['?', '?', '?', '?', '?', '?']); // Add some placeholder result slots

        // Submit Button
        const submitBtn = this.add.text(
            this.sys.game.scale.width / 2,
            this.sys.game.scale.height - 80,
            "Submit",
            {
                fontSize: "28px",
                color: "#ffffff",
                backgroundColor: "#8c7ae6",
                padding: { left: 12, right: 12, top: 6, bottom: 6 }
            }
        )
        .setOrigin(0.5)
        .setDepth(1000) // keep on top
        .setInteractive()
        .on("pointerdown", () => {
            console.log("Submit clicked ✅");

            // Collect labels safely
            const cards = this.resultSlots
                .map(slot => slot.card?.list?.[2]?.text ?? "")
                .filter(label => label !== "");

            console.log("Collected Cards:", cards);

            if (cards.length === 0) {
                console.warn("No cards in result slots!");
                return;
            }

            const result = evaluateExpression(cards);
            console.log("Evaluated Result:", result);

            const isCorrect = checkObjective(result, this.gameManager.getCurrentObjective());
            console.log("Objective:", this.gameManager.getCurrentObjective(), "=>", isCorrect);
            
            if (isCorrect) {
                this.gameManager.updateScore(10);
                this.gameManager.getGameState().advanceRound();
                const newHand = this.gameManager.getGameState().handCards;
                this.updateHand(newHand);
                this.setObjective(this.gameManager.getCurrentObjective());
                this.setGames(`${this.gameManager.getGameState().gamesPlayed} / ${this.gameManager.getGameState().maxGames}`);
            } else {
                this.gameManager.updateLives(-1);
            }

        });


        // UI is now updated via GameManager events - no direct event handling needed

        this.createDragEvents();
    }

    setHealth(ratio: number) {
        const r = Phaser.Math.Clamp(ratio, 0, 1);
        const fullWidth = (this.healthBarBg.width - GAME_CONFIG.LAYOUT.HEALTH_BAR_CALC_OFFSET);
        this.healthBarFill.width = Math.max(0, fullWidth * r);
        // Determine health bar color based on ratio
        let healthColor = 0xf1c40f; // Yellow
        if (r > GAME_CONFIG.HEALTH_WARNING) {
            healthColor = 0x2ecc71; // Green
        }
        if (r <= GAME_CONFIG.HEALTH_CRITICAL) {
            healthColor = 0xe74c3c; // Red
        }
        this.healthBarFill.fillColor = healthColor;
    }
    setGames(txt: string) {
        this.gamesCounter.text.setText(txt);
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
    }

    // Create drag events to allow card movement
    createDragEvents() {
        this.createCardDragStartEventListener();
        this.createCardDragHoldEventListener();
        this.createCardDragEndEventListener();
    }

    createCardDragStartEventListener() {
        this.input.on(Phaser.Input.Events.DRAG_START, (pointer, gameObject) => {
            gameObject.setAlpha(GAME_CONFIG.ALPHA.DRAGGING);
            gameObject.parentContainer?.bringToTop(gameObject);
            gameObject.shadow?.setAlpha(GAME_CONFIG.ALPHA.CARD_SHADOW);

            gameObject.setDepth(GAME_CONFIG.DRAG.DEPTH);
        });
    }

    createCardDragHoldEventListener() {
        this.input.on(Phaser.Input.Events.DRAG, (pointer, gameObject, cursorDragX, cursorDragY) => {
            gameObject.setPosition(cursorDragX, cursorDragY)
        });
    }

    createCardDragEndEventListener() {
        this.input.on(Phaser.Input.Events.DRAG_END, (pointer, gameObject) => {
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
        });
    }

    // Attach pointer listeners to a card container for click/drag logic
    attachCardPointerListeners(card: any) {
        card.on('pointerdown', function (pointer) {
            this._wasDrag = false;
        });
        card.on('dragstart', function (pointer) {
            this._wasDrag = true;
        });
        card.on('pointerup', function (pointer) {
            if (!this._wasDrag) {
                // click-to-move logic: move to first empty slot in opposing bar
                const scene = this.scene;
                if (scene.handSlots?.includes(this.slot)) {
                    const emptyResultSlot = scene.resultSlots?.find(s => !s.card);
                    if (emptyResultSlot) {
                        emptyResultSlot.setCard(this);
                    }
                } else if (scene.resultSlots?.includes(this.slot)) {
                    const emptyHandSlot = scene.handSlots?.find(s => !s.card);
                    if (emptyHandSlot) {
                        emptyHandSlot.setCard(this);
                    }
                }
            }
        });
    }
}