import Phaser from 'phaser';
import { GenerateObjective } from './GenerateObjective';
import { createCard } from './createCard.js';
import { createCardSlot } from './createCardSlot.js';
import { GAME_CONFIG } from './config/GameConstants';
import { createStyledRect, createLabelBox } from './utils/UIHelpers';


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

        // Layout constants - now using centralized constants
        const M = GAME_CONFIG.MARGIN;
        const SIDEBAR_W = GAME_CONFIG.SIDEBAR_WIDTH;
        const DECK_W = GAME_CONFIG.DECK_WIDTH;
        const MAIN_W = W - SIDEBAR_W - DECK_W - (M * 4);
        const MAIN_X = SIDEBAR_W + (M * 2);

        // UI helpers - now using centralized utilities
        this.rect = (x, y, w, h, fill = GAME_CONFIG.COLORS.GREEN_FELT, alpha = GAME_CONFIG.ALPHA.FELT, strokeColor = GAME_CONFIG.COLORS.WHITE, strokeWidth = 2) => {
            return createStyledRect(this, x, y, w, h, { fill, alpha, strokeColor, strokeWidth });
        };
        this.labelBox = (x, y, w, h, text, options = {}) => {
            return createLabelBox(this, x, y, w, h, text, options);
        };

        // Score Board panel
        this.sidebar = this.rect(M, M, SIDEBAR_W, H - M * 2, GAME_CONFIG.COLORS.BLACK, GAME_CONFIG.ALPHA.SIDEBAR);
        this.scoreTitle = this.add.text(M + SIDEBAR_W / 2, M + GAME_CONFIG.LAYOUT.SCORE_TITLE_Y_OFFSET, 'Score Board', { fontSize: GAME_CONFIG.FONT.SCORE_SIZE + 2, color: GAME_CONFIG.COLORS.BLACK }).setOrigin(0.5);
        this.currentScore = this.labelBox(M + GAME_CONFIG.INNER_PADDING, M + GAME_CONFIG.LAYOUT.CURRENT_SCORE_Y_OFFSET, SIDEBAR_W - GAME_CONFIG.INNER_PADDING * 2, GAME_CONFIG.LAYOUT.CURRENT_SCORE_HEIGHT, 'current game score');
        this.calcText = this.add.text(M + GAME_CONFIG.LAYOUT.CALC_TEXT_X_OFFSET, M + GAME_CONFIG.LAYOUT.CURRENT_SCORE_Y_OFFSET + GAME_CONFIG.LAYOUT.CURRENT_SCORE_HEIGHT + GAME_CONFIG.LAYOUT.CALC_TEXT_Y_OFFSET, 'calculations?\nmayber multipliers or smth else', { fontSize: GAME_CONFIG.FONT.CAPTION_SIZE, color: GAME_CONFIG.COLORS.DARK_GRAY, wordWrap: { width: SIDEBAR_W - GAME_CONFIG.LAYOUT.CALC_TEXT_WIDTH_OFFSET } });
        this.cumulated = this.labelBox(M + GAME_CONFIG.INNER_PADDING, H - M - GAME_CONFIG.LAYOUT.CUMULATED_Y_OFFSET, SIDEBAR_W - GAME_CONFIG.INNER_PADDING * 2, GAME_CONFIG.LAYOUT.CUMULATED_HEIGHT, 'Cumulated score (previous game)\nvs\nScore needed to pass the level', { fontSize: GAME_CONFIG.FONT.CAPTION_SIZE });

        // Health bar + Games counter
        this.healthBarBg = this.rect(MAIN_X, M, MAIN_W - GAME_CONFIG.LAYOUT.HEALTH_BAR_GAMES_COUNTER_WIDTH, GAME_CONFIG.LAYOUT.HEALTH_BAR_HEIGHT, GAME_CONFIG.COLORS.RED, GAME_CONFIG.ALPHA.HEALTH_BG);
        this.healthBarFill = this.add.rectangle(MAIN_X + GAME_CONFIG.LAYOUT.HEALTH_BAR_INSET, M + GAME_CONFIG.LAYOUT.HEALTH_BAR_INSET, (MAIN_W - GAME_CONFIG.LAYOUT.HEALTH_BAR_GAMES_COUNTER_WIDTH) - GAME_CONFIG.LAYOUT.HEALTH_BAR_BORDER, GAME_CONFIG.LAYOUT.HEALTH_BAR_HEIGHT - GAME_CONFIG.LAYOUT.HEALTH_BAR_BORDER, GAME_CONFIG.COLORS.GREEN, GAME_CONFIG.ALPHA.HEALTH_FILL).setOrigin(0, 0);
        this.healthHint = this.add.text(this.healthBarBg.x, this.healthBarBg.y - GAME_CONFIG.LAYOUT.HEALTH_HINT_Y_OFFSET, 'Health bar\n(deduct health if objective is impossible for current hand)', { fontSize: GAME_CONFIG.FONT.HINT_SIZE, color: GAME_CONFIG.COLORS.MEDIUM_GRAY }).setOrigin(0, 1);
        this.gamesCounter = this.labelBox(MAIN_X + MAIN_W - GAME_CONFIG.LAYOUT.GAMES_COUNTER_WIDTH, M, GAME_CONFIG.LAYOUT.GAMES_COUNTER_WIDTH, GAME_CONFIG.LAYOUT.GAMES_COUNTER_HEIGHT, GAME_CONFIG.LAYOUT.DEFAULT_GAME_TEXT);

        // Objective label
        this.objective = this.labelBox(MAIN_X + MAIN_W / 2 - GAME_CONFIG.LAYOUT.OBJECTIVE_WIDTH / 2, M + GAME_CONFIG.LAYOUT.OBJECTIVE_Y_OFFSET, GAME_CONFIG.LAYOUT.OBJECTIVE_WIDTH, GAME_CONFIG.LAYOUT.OBJECTIVE_HEIGHT, GAME_CONFIG.LAYOUT.DEFAULT_OBJECTIVE_TEXT, { fontSize: GAME_CONFIG.FONT.OBJECTIVE_SIZE, fontStyle: 'bold' });
        this.objectiveCaption = this.add.text(this.objective.group.x + GAME_CONFIG.LAYOUT.OBJECTIVE_WIDTH / 2, this.objective.group.y - GAME_CONFIG.LAYOUT.OBJECTIVE_CAPTION_Y_OFFSET, 'Objective', { fontSize: GAME_CONFIG.FONT.HINT_SIZE, color: GAME_CONFIG.COLORS.MEDIUM_GRAY }).setOrigin(0.5, 1);


        // -------------- Test Section remove any time
        this.objectiveTestLabel = this.add.text(MAIN_X + MAIN_W / 2 + GAME_CONFIG.LAYOUT.TEST_LABEL_X_OFFSET, M + GAME_CONFIG.LAYOUT.TEST_LABEL_Y_OFFSET, 'Test Objective', {
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

        // Result slots
        this.resultBar = this.rect(MAIN_X + GAME_CONFIG.LAYOUT.RESULT_BAR_X_OFFSET, this.objective.group.y + GAME_CONFIG.LAYOUT.RESULT_BAR_Y_OFFSET, MAIN_W - GAME_CONFIG.LAYOUT.RESULT_BAR_WIDTH_OFFSET, GAME_CONFIG.LAYOUT.RESULT_BAR_HEIGHT, GAME_CONFIG.COLORS.BLACK, GAME_CONFIG.ALPHA.RESULT_BAR);
        this.equalsText = this.add.text(this.resultBar.x + this.resultBar.width + GAME_CONFIG.LAYOUT.RESULT_EQUALS_X_OFFSET, this.resultBar.y + GAME_CONFIG.LAYOUT.RESULT_EQUALS_Y_OFFSET, '=  ?', { fontSize: GAME_CONFIG.LAYOUT.RESULT_EQUALS_FONT_SIZE, color: GAME_CONFIG.COLORS.BLACK });


        // Hand bar
        this.handBar = this.rect(MAIN_X + GAME_CONFIG.LAYOUT.HAND_BAR_X_OFFSET, this.resultBar.y + GAME_CONFIG.LAYOUT.HAND_BAR_Y_OFFSET, MAIN_W - GAME_CONFIG.LAYOUT.HAND_BAR_WIDTH_OFFSET, GAME_CONFIG.LAYOUT.HAND_BAR_HEIGHT, GAME_CONFIG.COLORS.BLACK, GAME_CONFIG.ALPHA.HAND_BAR);
        this.handCaption = this.add.text(this.handBar.x + this.handBar.width / 2, this.handBar.y + this.handBar.height + GAME_CONFIG.LAYOUT.HAND_CAPTION_Y_OFFSET, 'Cards, either operator(+,-,*,/) or number (0–9)', { fontSize: GAME_CONFIG.FONT.CAPTION_SIZE, color: GAME_CONFIG.COLORS.MEDIUM_GRAY }).setOrigin(0.5, 0);


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
        this.healthBarFill.fillColor = r > GAME_CONFIG.HEALTH_WARNING ? GAME_CONFIG.COLORS.GREEN : (r > GAME_CONFIG.HEALTH_CRITICAL ? GAME_CONFIG.COLORS.YELLOW : GAME_CONFIG.COLORS.RED_CRITICAL);
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
        const innerPad = GAME_CONFIG.INNER_PADDING, cardW = GAME_CONFIG.CARD_WIDTH, cardH = GAME_CONFIG.CARD_HEIGHT;
        const innerW = this.handBar.width - innerPad * 2;
        const gap = Math.max(GAME_CONFIG.CARD_GAP, (innerW - count * cardW) / (count + 1));
        let x = this.handBar.x + innerPad + gap;
        const y = this.handBar.y + (this.handBar.height - cardH) / 2;

        this.handSlots = [];
        for (let i = 0; i < count; i++) {
            const slot = createCardSlot(this, x, y, cardW, cardH, {});
            this.handSlots.push(slot);
            this.handContainer.add(slot);
            x += cardW + gap;
        }
    }
    updateHand(items = []) {
        const cardW = GAME_CONFIG.CARD_WIDTH, cardH = GAME_CONFIG.CARD_HEIGHT;

        for (let i = 0; i < this.handSlots.length; i++) {
            const slot = this.handSlots[i];
            const label = (items[i] ?? '').toString();
            const isPlaceholder = items.length === 0;

            const card = createCard(this, 0, 0, cardW, cardH, label, true, { fontSize: GAME_CONFIG.FONT.CARD_SIZE, color: GAME_CONFIG.COLORS.BLACK });
            if (isPlaceholder) {
                card.list[1].fillColor = GAME_CONFIG.COLORS.LIGHT_PLACEHOLDER;
                card.list[2].setText('');
            }
            slot.setCard(card);
            card.slot = slot; // link card to its slot

            this.handContainer.add(card);
            this.attachCardPointerListeners(card);
        }
    }
    createResultSlots(count) {
        const innerPad = GAME_CONFIG.INNER_PADDING, cardW = GAME_CONFIG.CARD_WIDTH, cardH = GAME_CONFIG.CARD_HEIGHT;
        const innerW = this.resultBar.width - innerPad * 2;
        const gap = Math.max(GAME_CONFIG.CARD_GAP, (innerW - count * cardW) / (count + 1));
        let x = this.resultBar.x + innerPad + gap;
        const y = this.resultBar.y + (this.resultBar.height - cardH) / 2;

        this.resultSlots = [];
        for (let i = 0; i < count; i++) {
            const slot = createCardSlot(this, x, y, cardW, cardH, {});
            this.resultSlots.push(slot);
            this.resultContainer.add(slot);
            x += cardW + gap;
        }
    }
    updateResultSlots(items = []) {
        const cardW = GAME_CONFIG.CARD_WIDTH, cardH = GAME_CONFIG.CARD_HEIGHT;
        for (let i = 0; i < this.resultSlots.length; i++) {
            const slot = this.resultSlots[i];
            const label = (items[i] ?? '').toString();
            const isPlaceholder = items.length === 0;
            const card = createCard(this, 0, 0, cardW, cardH, label, true, { fontSize: GAME_CONFIG.FONT.CARD_SIZE, color: GAME_CONFIG.COLORS.BLACK });
            if (isPlaceholder) {
                card.list[1].fillColor = GAME_CONFIG.COLORS.LIGHT_PLACEHOLDER;
                card.list[2].setText('');
            }
            slot.setCard(card);
            card.slot = slot;
            this.resultContainer.add(card);
            this.attachCardPointerListeners(card);
        }
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
            if (gameObject.parentContainer) {
                gameObject.parentContainer.bringToTop(gameObject);
            }
            if (gameObject.shadow) {
                gameObject.shadow.setAlpha(GAME_CONFIG.ALPHA.CARD_SHADOW);
            }

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
            if (gameObject.shadow) {
                gameObject.shadow.setAlpha(1);
            }
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