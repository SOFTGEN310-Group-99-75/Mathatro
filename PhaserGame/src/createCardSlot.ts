
import { GAME_CONFIG } from './config/GameConstants';

/**
 * Creates an interactive card slot (drop zone) for the game
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position  
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {Object} opts - Options object with fill and alpha properties
 * @returns {Phaser.GameObjects.Container} Container with slot functionality
 */

export const createCardSlot = (scene, x, y, w, h, opts = {}) => {
    const group = scene.add.container(x, y);
    const rect = scene.add.rectangle(0, 0, w, h, opts.fill ?? GAME_CONFIG.COLORS.GRAY, opts.alpha ?? 0.3)
        .setOrigin(0, 0)
        .setStrokeStyle(GAME_CONFIG.CARD_BORDER_WIDTH, GAME_CONFIG.COLORS.LIGHT_GRAY)
        .setInteractive();


    group.add(rect);

    group.card = null;

    // place a card into the slot where 'newCard' is the card to replace current card in slot
    group.setCard = (newCard) => {

        // remove newCard from old slot if it has one
        if (newCard.slot && newCard.slot !== group) {
            newCard.slot.card = null;
        }

        // remove current card from the current slot if it has one
        if (group.card && group.card !== newCard) {
            group.card.slot = null;
        }

        group.card = newCard;
        newCard.slot = group;

        newCard.setPosition(group.x - group.width / 2, group.y);
    };

    // for checking whether pointer is over the slot
    group.isPointerOver = (pointer) => {
        const slotBounds = rect.getBounds();
        return slotBounds.contains(pointer.x, pointer.y);
    };

    return group;

}
