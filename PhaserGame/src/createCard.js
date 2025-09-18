import { createStyledCard } from './utils/UIHelpers';
import { GAME_CONFIG } from './config/GameConstants';

/**
 * Create a card game object - now uses centralized utilities
 */
export const createCard = (scene, x, y, w, h, label = '', draggable = false, opts = {}) => {
    // Use the standardized card creation from UIHelpers
    return createStyledCard(scene, x, y, w, h, label, draggable, {
        fontSize: opts.fontSize ?? GAME_CONFIG.FONT.CARD_SIZE,
        color: opts.color ?? GAME_CONFIG.COLORS.BLACK,
        fontStyle: opts.fontStyle ?? 'bold'
    });
}