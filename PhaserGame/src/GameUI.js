import Phaser from 'phaser';
import { createCard } from './createCard.js';

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
        // Layout constants
        const M = 12;
        const SIDEBAR_W = 170;
        const DECK_W = 120;
        const MAIN_W = W - SIDEBAR_W - DECK_W - (M * 4);
        const MAIN_X = SIDEBAR_W + (M * 2);

        // UI helpers
        this.rect = (x, y, w, h, fill = 0x206030, alpha = 0.35, strokeColor = 0xffffff, strokeWidth = 2) => {
            // fill: green felt, stroke: white
            const r = this.add.rectangle(x, y, w, h, fill, alpha).setOrigin(0, 0);
            r.setStrokeStyle(strokeWidth, strokeColor, 0.7);
            return r;
        };
        this.labelBox = (x, y, w, h, text, options = {}) => {
            const group = this.add.container(x, y);
            const box = this.rect(0, 0, w, h, options.fill ?? 0x206030, options.alpha ?? 0.35, 0xffffff, 2);
            const t = this.add.text(w / 2, h / 2, text, {
                fontSize: options.fontSize ?? 16,
                color: options.color ?? '#ffffff', // white text
                fontStyle: options.fontStyle ?? 'bold',
                align: options.align ?? 'center',
                backgroundColor: options.bg ?? null,
                stroke: '#000000',
                strokeThickness: 2,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 2,
                    fill: true
                }
            }).setOrigin(0.5);
            group.add([box, t]);
            return { group, box, t };
        };

        // Score Board panel
        this.sidebar = this.rect(M, M, SIDEBAR_W, H - M * 2, 0x000000, 0.08);
        this.scoreTitle = this.add.text(M + SIDEBAR_W / 2, M + 14, 'Score Board', { fontSize: 18, color: '#000000' }).setOrigin(0.5);
        this.currentScore = this.labelBox(M + 12, M + 34, SIDEBAR_W - 24, 44, 'current game score');
        this.calcText = this.add.text(M + 16, M + 34 + 44 + 20, 'calculations?\nmayber multipliers or smth else', { fontSize: 12, color: '#333333', wordWrap: { width: SIDEBAR_W - 32 } });
        this.cumulated = this.labelBox(M + 12, H - M - 100, SIDEBAR_W - 24, 80, 'Cumulated score (previous game)\nvs\nScore needed to pass the level', { fontSize: 12 });

        // Health bar + Games counter
        this.healthBarBg = this.rect(MAIN_X, M, MAIN_W - 110, 22, 0xff0000, 0.15);
        this.healthBarFill = this.add.rectangle(MAIN_X + 2, M + 2, (MAIN_W - 110) - 4, 22 - 4, 0x2ecc71, 0.55).setOrigin(0, 0);
        this.healthHint = this.add.text(this.healthBarBg.x, this.healthBarBg.y - 12, 'Health bar\n(deduct health if objective is impossible for current hand)', { fontSize: 10, color: '#666666' }).setOrigin(0, 1);
        this.gamesCounter = this.labelBox(MAIN_X + MAIN_W - 92, M, 92, 30, '1 / 10');

        // Objective label
        this.objective = this.labelBox(MAIN_X + MAIN_W / 2 - 60, M + 70, 120, 36, '> 17', { fontSize: 20, fontStyle: 'bold' });
        this.objectiveCaption = this.add.text(this.objective.group.x + 60, this.objective.group.y - 6, 'Objective', { fontSize: 10, color: '#666666' }).setOrigin(0.5, 1);

        // Result slots
        this.slotsBar = this.rect(MAIN_X + 40, this.objective.group.y + 50, MAIN_W - 80, 52, 0x000000, 0.05);
        this.SLOT_N = 6;
        this.slotW = 40;
        this.slotPad = ((MAIN_W - 80) - (this.SLOT_N * this.slotW)) / (this.SLOT_N + 1);
        this.slots = [];
        for (let i = 0; i < this.SLOT_N; i++) {
            const sx = this.slotsBar.x + this.slotPad + i * (this.slotW + this.slotPad);
            this.slots.push(this.rect(sx, this.slotsBar.y + 6, this.slotW, 40, 0x000000, 0.08));
        }
        this.equalsText = this.add.text(this.slotsBar.x + this.slotsBar.width + 8, this.slotsBar.y + 12, '=  ?', { fontSize: 20, color: '#000000' });

        // Hand bar
        this.handBar = this.rect(MAIN_X + 20, this.slotsBar.y + 80, MAIN_W - 40, 110, 0x000000, 0.05);
        this.handCaption = this.add.text(this.handBar.x + this.handBar.width / 2, this.handBar.y + this.handBar.height + 16, 'Cards, either operator(+,-,*,/) or number (0–9)', { fontSize: 12, color: '#666666' }).setOrigin(0.5, 0);

        // Containers for dynamic visuals
        this.slotsContainer = this.add.container(0, 0).setDepth(1002);
        this.handContainer = this.add.container(0, 0).setDepth(1002);

        // Initialize with defaults
        this.setHealth(1);
        this.setGames('1 / 10');
        this.setObjective('> 17');
        this.setScore(0);
        this.updateHand([]);
        this.updateSlots([]);

        // Event handlers for UI updates
        this.game.events.on('ui:update', (payload = {}) => {
            if (typeof payload.health === 'number') this.setHealth(payload.health);
            if (typeof payload.games === 'string') this.setGames(payload.games);
            if (typeof payload.score === 'number' || typeof payload.score === 'string') this.setScore(payload.score);
            if (typeof payload.objective === 'string') this.setObjective(payload.objective);
        });
        this.game.events.on('ui:hand', (items = []) => this.updateHand(items));
        this.game.events.on('ui:slots', (items = []) => this.updateSlots(items));

        this.createDragEvents();
    }

    setHealth(ratio) {
        const r = Phaser.Math.Clamp(ratio, 0, 1);
        const fullWidth = (this.healthBarBg.width - 4);
        this.healthBarFill.width = Math.max(0, fullWidth * r);
        this.healthBarFill.fillColor = r > 0.5 ? 0x2ecc71 : (r > 0.25 ? 0xf1c40f : 0xe74c3c);
    }
    setGames(txt) {
        this.gamesCounter.t.setText(txt);
    }
    setObjective(txt) {
        this.objective.t.setText(txt);
    }
    setScore(val) {
        this.currentScore.t.setText(String(val));
    }
    updateHand(items = []) {
        this.handContainer.removeAll(true);
        const innerPad = 12, cardW = 60, cardH = 84;
        const n = items.length || 8;
        const innerW = this.handBar.width - innerPad * 2;
        const gap = Math.max(8, (innerW - n * cardW) / (n + 1));
        let x = this.handBar.x + innerPad + gap;
        const y = this.handBar.y + (this.handBar.height - cardH) / 2;
        for (let i = 0; i < n; i++) {
            const label = (items[i] ?? '').toString();
            const isPlaceholder = items.length === 0;
            const card = createCard(this, x, y, cardW, cardH, label, true,{ fontSize: 22, color: '#222222' });
            if (isPlaceholder) {
                card.list[1].fillColor = 0xeeeeee;
                card.list[2].setText('');
            }
            this.handContainer.add(card);
            x += cardW + gap;
        }
    }
    updateSlots(items = []) {
        this.slotsContainer.removeAll(true);
        const cardW2 = this.slotW, cardH2 = 40;
        for (let i = 0; i < Math.min(items.length, this.SLOT_N); i++) {
            const r = this.slots[i];
            const cx = r.x + (r.width - cardW2) / 2;
            const cy = r.y + (r.height - cardH2) / 2;
            const card = createCard(this, cx, cy, cardW2, cardH2, String(items[i]), false, { fontSize: 18 });
            this.slotsContainer.add(card);
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
            gameObject.setAlpha(0.85);
            if (gameObject.parentContainer) {
                gameObject.parentContainer.bringToTop(gameObject);
            }
            if (gameObject.shadow) {
                gameObject.shadow.setAlpha(0.4);
            }

            gameObject.setDepth(100);
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
        });
    }
}