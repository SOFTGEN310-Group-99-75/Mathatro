/**
 * Game Configuration Constants
 * Centralizes all magic numbers and configuration values for better maintainability
 */

export const GAME_CONFIG = {
    // Display dimensions
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    BACKGROUND_COLOR: '#f8f8ff',

    // Game progression
    MAX_LEVELS: 10,
    INITIAL_LIVES: 3,

    // Health system
    HEALTH_FULL: 1,
    HEALTH_WARNING: 0.5,
    HEALTH_CRITICAL: 0.25,

    // Card dimensions
    CARD_WIDTH: 60,
    CARD_HEIGHT: 84,
    CARD_BORDER_WIDTH: 3,
    CARD_BORDER_COLOR: 0xd4af37,
    CARD_SHADOW_OFFSET_X: 4,
    CARD_SHADOW_OFFSET_Y: 6,
    CARD_SHADOW_ALPHA: 0.18,

    // Layout constants
    MARGIN: 12,
    SIDEBAR_WIDTH: 170,
    DECK_WIDTH: 120,
    INNER_PADDING: 12,
    CARD_GAP: 8,

    // UI Colors
    COLORS: {
        GREEN_FELT: 0x206030,
        WHITE: '#ffffff',
        BLACK: '#000000',
        PURPLE: '#8c7ae6',
        LIGHT_PURPLE: '#9c88ff',
        RED: '#ff0000',
        GREEN: 0x2ecc71,
        YELLOW: 0xf1c40f,
        RED_CRITICAL: 0xe74c3c,
        GRAY: 0xbbbbbb,
        LIGHT_GRAY: 0xa1a1a1,
        BLUE: 0x3498db,
    },

    // UI Alpha values
    ALPHA: {
        FELT: 0.35,
        HEALTH_BG: 0.15,
        HEALTH_FILL: 0.55,
        RESULT_BAR: 0.05,
        HAND_BAR: 0.05,
        SIDEBAR: 0.08,
        VOLUME_OFF: 0.5,
        CARD_SHADOW: 0.4,
        DRAGGING: 0.85,
    },

    // Text styling
    FONT: {
        TITLE_SIZE: 40,
        OBJECTIVE_SIZE: 20,
        CARD_SIZE: 22,
        SCORE_SIZE: 16,
        CAPTION_SIZE: 12,
        HINT_SIZE: 10,
        STROKE_THICKNESS: 4,
        STROKE_COLOR: '#000000',
        SHADOW_OFFSET_X: 2,
        SHADOW_OFFSET_Y: 2,
        SHADOW_BLUR: 2,
    },

    // Animation
    ANIMATION: {
        FADE_DURATION: 500,
        TWEEN_DURATION: 800,
        BOUNCE_EASING: 'Bounce.InOut',
    },

    // Audio
    AUDIO: {
        THEME_VOLUME: 0.5,
        SFX_VOLUME: 1.3,
        WHOOSH_VOLUME: 1.3,
    },

    // Drag and drop
    DRAG: {
        DISTANCE_THRESHOLD: 8,
        DEPTH: 100,
    },

    // Hand and result slots
    HAND_SLOTS: 8,
    RESULT_SLOTS: 6,

    // Card values
    CARD_VALUES: {
        MIN_NUMBER: 0,
        MAX_NUMBER: 9,
        OPERATORS: ['+', '-', '*', '/', '^'],
    },

    // Objective generation
    OBJECTIVE: {
        MIN_COMPARISON_VALUE: 1,
        MAX_COMPARISON_VALUE: 100,
        MIN_DIVISOR: 3,
        MAX_DIVISOR: 10,
        MIN_POWER: 2,
        MAX_POWER: 5,
        MIN_FACTOR: 10,
        MAX_FACTOR: 100,
    }
} as const;

export const OBJECTIVE_TYPES = [
    "Greater than",
    "Less than",
    "Equal to",
    "Divisible by",
    "Power of",
    "Prime number",
    "Odd number",
    "Even number",
    "Factor of",
] as const;

export const PRIME_NUMBERS = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97
] as const;

export const CARD_NAMES = [
    "card-0", "card-1", "card-2", "card-3", "card-4", "card-5"
] as const;
