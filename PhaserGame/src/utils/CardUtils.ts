import { createStyledCard } from './UIHelpers';
import { GAME_CONFIG } from '../config/GameConstants';

/**
 * CardUtils - Utility functions for card creation and management
 * Eliminates code duplication across the codebase
 */
export class CardUtils {
    /**
     * Create a card with standard styling
     */
    static createStandardCard(scene: Phaser.Scene, x: number, y: number, label: string, draggable = true) {
        return createStyledCard(scene, x, y,
            GAME_CONFIG.CARD_WIDTH,
            GAME_CONFIG.CARD_HEIGHT,
            label,
            {
                draggable,
                fontSize: GAME_CONFIG.FONT.CARD_SIZE,
                color: GAME_CONFIG.COLORS.BLACK
            }
        );
    }

    /**
     * Create a placeholder card (empty slot)
     */
    static createPlaceholderCard(scene: Phaser.Scene, x: number, y: number) {
        const card = this.createStandardCard(scene, x, y, '', true);

        // Style as placeholder
        (card.list[1] as any).fillColor = GAME_CONFIG.COLORS.LIGHT_PLACEHOLDER;
        (card.list[2] as any).setText('');

        return card;
    }

    /**
     * Update a card's appearance to be a placeholder
     */
    static setCardAsPlaceholder(card: any) {
        card.list[1].fillColor = GAME_CONFIG.COLORS.LIGHT_PLACEHOLDER;
        card.list[2].setText('');
    }

    /**
     * Update a card's appearance with content
     */
    static setCardWithContent(card: any, label: string) {
        card.list[1].fillColor = 0xffffff; // White background
        card.list[2].setText(label);
    }

    /**
     * Create multiple cards from an array of labels
     */
    static createCardsFromArray(scene: Phaser.Scene, positions: any[], labels: string[], draggable = true) {
        return labels.map((label, index) => {
            const position = positions[index];
            return this.createStandardCard(scene, position.x, position.y, label, draggable);
        });
    }

    /**
     * Update multiple cards in slots
     */
    static updateCardsInSlots(scene: Phaser.Scene, slots: any[], items: any[]) {
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const raw = items[i];
            const label = (raw ?? '').toString();
            const isPlaceholder = label === '' || label === '?';

            // Destroy any existing card to avoid stacking when doing a bulk refresh
            if (slot.card) {
                slot.card.destroy();
                slot.card = null;
            }

            const displayLabel = isPlaceholder ? '?' : label;
            const card = this.createStandardCard(scene, 0, 0, displayLabel, true);
            if (isPlaceholder) {
                this.setCardAsPlaceholder(card);
                (card as any).list[2].setText('?');
                (card as any).isPlaceholder = true;
            } else {
                this.setCardWithContent(card, displayLabel);
                (card as any).isPlaceholder = false;
            }
            slot.setCard(card);
        }
    }
}
