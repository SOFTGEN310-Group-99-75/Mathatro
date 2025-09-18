import Phaser from 'phaser';
import { GenerateObjective } from './GenerateObjective';
import { createCardSlot } from './createCardSlot';
import { GAME_CONFIG } from './config/GameConstants';
import { createStyledRect, createLabelBox } from './utils/UIHelpers';
import { LayoutManager } from './ui/LayoutManager';
import { GameStateManager } from './game/GameStateManager';
import { CardUtils } from './utils/CardUtils';


/**
 * Game UI Scene
 * Handles the user interface elements of the game.
 */
export class GameUI extends Phaser.Scene {
    constructor() {
        super({ key: 'GameUI' });
    }

    create() {
        this.scene.bringToTop();
        const { width: W, height: H } = this.sys.game.scale;
        this.input.dragDistanceThreshold = GAME_CONFIG.DRAG.DISTANCE_THRESHOLD;

        // Initialize managers
        this.gameState = new GameStateManager();
        this.layout = LayoutManager.calculateCompleteLayout(W, H);

        // Store layout dimensions for easy access
        const { sidebar, healthBar, gamesCounter, objective, resultBar, handBar, testSection } = this.layout;

        // UI helpers - now using centralized utilities
        this.rect = (x, y, w, h, fill = GAME_CONFIG.COLORS.GREEN_FELT, alpha = GAME_CONFIG.ALPHA.FELT, strokeColor = GAME_CONFIG.COLORS.WHITE, strokeWidth = 2) => {
            return createStyledRect(this, x, y, w, h, { fill, alpha, strokeColor, strokeWidth });
        };
        this.labelBox = (x, y, w, h, text, options = {}) => {
            return createLabelBox(this, x, y, w, h, text, options);
        };

        // Score Board panel - using LayoutManager
        this.sidebar = this.rect(sidebar.x, sidebar.y, sidebar.width, sidebar.height, GAME_CONFIG.COLORS.BLACK, GAME_CONFIG.ALPHA.SIDEBAR);
        this.scoreTitle = this.add.text(sidebar.scoreTitleX, sidebar.scoreTitleY, 'Score Board', { fontSize: GAME_CONFIG.FONT.SCORE_SIZE + 2, color: GAME_CONFIG.COLORS.BLACK }).setOrigin(0.5);
        this.currentScore = this.labelBox(sidebar.currentScoreX, sidebar.currentScoreY, sidebar.currentScoreWidth, sidebar.currentScoreHeight, 'current game score');
        this.calcText = this.add.text(sidebar.calcTextX, sidebar.calcTextY, 'calculations?\nmayber multipliers or smth else', { fontSize: GAME_CONFIG.FONT.CAPTION_SIZE, color: GAME_CONFIG.COLORS.DARK_GRAY, wordWrap: { width: sidebar.width - GAME_CONFIG.LAYOUT.CALC_TEXT_WIDTH_OFFSET } });
        this.cumulated = this.labelBox(sidebar.cumulatedX, sidebar.cumulatedY, sidebar.cumulatedWidth, sidebar.cumulatedHeight, 'Cumulated score (previous game)\nvs\nScore needed to pass the level', { fontSize: GAME_CONFIG.FONT.CAPTION_SIZE });

        // Health bar + Games counter - using LayoutManager
        this.healthBarBg = this.rect(healthBar.backgroundX, healthBar.backgroundY, healthBar.backgroundWidth, healthBar.backgroundHeight, GAME_CONFIG.COLORS.RED, GAME_CONFIG.ALPHA.HEALTH_BG);
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
            fill: GAME_CONFIG.COLORS.BLUE,
            alpha: GAME_CONFIG.LAYOUT.DEFAULT_ALPHA,
            fontStyle: 'bold',
        });
        this.objectiveTestLabel.setInteractive();
        // when label box is clicked, call generateObjective
        this.objectiveTestLabel.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.setObjective();
        });
        // -----------------------------------------

        // Result slots - using LayoutManager
        this.resultBar = this.rect(resultBar.x, resultBar.y, resultBar.width, resultBar.height, GAME_CONFIG.COLORS.BLACK, GAME_CONFIG.ALPHA.RESULT_BAR);
        this.equalsText = this.add.text(resultBar.equalsX, resultBar.equalsY, '=  ?', { fontSize: GAME_CONFIG.LAYOUT.RESULT_EQUALS_FONT_SIZE, color: GAME_CONFIG.COLORS.BLACK });

        // Hand bar - using LayoutManager
        this.handBar = this.rect(handBar.x, handBar.y, handBar.width, handBar.height, GAME_CONFIG.COLORS.BLACK, GAME_CONFIG.ALPHA.HAND_BAR);
        this.handCaption = this.add.text(handBar.captionX, handBar.captionY, 'Cards, either operator(+,-,*,/) or number (0–9)', { fontSize: GAME_CONFIG.FONT.CAPTION_SIZE, color: GAME_CONFIG.COLORS.MEDIUM_GRAY }).setOrigin(0.5, 0);


        // Containers for dynamic visuals
        this.resultContainer = this.add.container(0, 0).setDepth(GAME_CONFIG.DRAG.DEPTH + 2);
        this.handContainer = this.add.container(0, 0).setDepth(GAME_CONFIG.DRAG.DEPTH + 2);

        // Initialize with defaults
        this.setHealth(GAME_CONFIG.HEALTH_FULL);
        this.setGames(GAME_CONFIG.LAYOUT.DEFAULT_GAME_TEXT);
        this.setObjective(GAME_CONFIG.LAYOUT.DEFAULT_OBJECTIVE_TEXT);
        this.setScore(GAME_CONFIG.DEFAULT_SCORE);
        this.createHandSlots(GAME_CONFIG.HAND_SLOTS);
        this.updateHand([1, 2, 3, 4, 'x', '+', '/']);
        this.createResultSlots(GAME_CONFIG.RESULT_SLOTS);


        // Event handlers for UI updates
        this.game.events.on('ui:update', (payload = {}) => {
            if (typeof payload.health === 'number') this.setHealth(payload.health);
            if (typeof payload.games === 'string') this.setGames(payload.games);
            if (typeof payload.score === 'number' || typeof payload.score === 'string') this.setScore(payload.score);
            if (typeof payload.objective === 'string') this.setObjective(payload.objective);
        });
        this.game.events.on('ui:hand', (items = []) => this.updateHand(items));
        this.game.events.on('ui:result', (items = []) => this.updateResultSlots(items));

        this.createDragEvents();
    }

    setHealth(ratio) {
        const r = Phaser.Math.Clamp(ratio, 0, 1);
        const fullWidth = (this.healthBarBg.width - GAME_CONFIG.LAYOUT.HEALTH_BAR_CALC_OFFSET);
        this.healthBarFill.width = Math.max(0, fullWidth * r);
        // Determine health bar color based on ratio
        let healthColor = GAME_CONFIG.COLORS.RED_CRITICAL;
        if (r > GAME_CONFIG.HEALTH_CRITICAL) {
            healthColor = GAME_CONFIG.COLORS.YELLOW;
        }
        if (r > GAME_CONFIG.HEALTH_WARNING) {
            healthColor = GAME_CONFIG.COLORS.GREEN;
        }
        this.healthBarFill.fillColor = healthColor;
    }
    setGames(txt) {
        this.gamesCounter.t.setText(txt);
    }
    setObjective(txt) {
        this.objective.t.setText(GenerateObjective());
    }
    setScore(val) {
        this.currentScore.t.setText(String(val));
    }
    createHandSlots(count) {
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
    updateHand(items = []) {
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
    createResultSlots(count) {
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
    updateResultSlots(items = []) {
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
    attachCardPointerListeners(card) {
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
                if (scene.handSlots && scene.handSlots.includes(this.slot)) {
                    const emptyResultSlot = (scene.resultSlots || []).find(s => !s.card);
                    if (emptyResultSlot) {
                        emptyResultSlot.setCard(this);
                    }
                } else if (scene.resultSlots && scene.resultSlots.includes(this.slot)) {
                    const emptyHandSlot = (scene.handSlots || []).find(s => !s.card);
                    if (emptyHandSlot) {
                        emptyHandSlot.setCard(this);
                    }
                }
            }
        });
    }
}