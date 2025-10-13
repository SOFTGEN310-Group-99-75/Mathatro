
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

export const createCardSlot = (scene: Phaser.Scene, x: number, y: number, w: number, h: number, opts: any = {}) => {
    const group = scene.add.container(x, y);
    // Modern card slot with rounded corners and subtle styling
    const rect = scene.add.graphics();
    rect.fillStyle(opts.fill ?? GAME_CONFIG.COLORS.LIGHT_BG, opts.alpha ?? 0.4);
    rect.lineStyle(2, GAME_CONFIG.COLORS.MEDIUM_BG, 0.6);
    rect.fillRoundedRect(0, 0, w, h, 8);
    rect.strokeRoundedRect(0, 0, w, h, 8);
    rect.setInteractive();


    group.add(rect);

    (group as any).card = null;

    // place a card into the slot where 'newCard' is the card to replace current card in slot
    (group as any).setCard = (newCard: any) => {
        // If newCard already belongs to a different slot, detach from that slot
        if (newCard.slot && newCard.slot !== group) {
            if (newCard.slot.card === newCard) {
                newCard.slot.card = null;
            }
        }

        const existing = (group as any).card;

        // If existing card present and different, release it (but do not destroy here)
        if (existing && existing !== newCard) {
            existing.slot = null;
        }

        (group as any).card = newCard;
        newCard.slot = group;

        // Position card so its top-left matches slot top-left
        newCard.setPosition(group.x, group.y);
    };

    // for checking whether pointer is over the slot
    (group as any).isPointerOver = (pointer: Phaser.Input.Pointer) => {
        const slotX = group.x;
        const slotY = group.y;
        return pointer.x >= slotX && pointer.x <= slotX + w &&
            pointer.y >= slotY && pointer.y <= slotY + h;
    };

    return group;

}
