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
    INITIAL_LIVES: 3,
    DEFAULT_LEVEL: 1,
    DEFAULT_SCORE: 0,

    // Health system
    HEALTH_FULL: 1,
    HEALTH_WARNING: 0.5,
    HEALTH_CRITICAL: 0.25,

    // Card dimensions - Enhanced styling
    CARD_WIDTH: 60,
    CARD_HEIGHT: 84,
    CARD_BORDER_WIDTH: 2,
    CARD_BORDER_COLOR: 0xd4af37,
    CARD_SHADOW_OFFSET_X: 3,
    CARD_SHADOW_OFFSET_Y: 4,
    CARD_SHADOW_ALPHA: 0.25,

    // Layout constants
    MARGIN: 12,
    SIDEBAR_WIDTH: 170,
    DECK_WIDTH: 120,
    INNER_PADDING: 35,
    CARD_GAP: 8,

    // UI Colors - Modern Palette
    COLORS: {
        // Primary Colors
        DEEP_PURPLE: 0x4a5568,
        NAVY_BLUE: 0x2d3748,
        VIBRANT_BLUE: 0x3182ce,
        DARK_BLUE: 0x2c5aa0,

        // Accent Colors
        WARM_ORANGE: 0xed8936,
        DARK_ORANGE: 0xdd6b20,
        FRESH_GREEN: 0x48bb78,
        DARK_GREEN: 0x38a169,
        CORAL_RED: 0xfc8181,
        AMBER: 0xf6ad55,

        // Background Colors
        LIGHT_BG: 0xf7fafc,
        MEDIUM_BG: 0xedf2f7,
        DARK_BG: 0xe2e8f0,

        // Legacy colors for compatibility
        GREEN_FELT: 0x48bb78,
        WHITE: '#ffffff',
        BLACK: '#000000',
        PURPLE: '#8c7ae6',
        LIGHT_PURPLE: '#9c88ff',
        RED: '#ff0000',
        GREEN: 0x48bb78,
        YELLOW: 0xf6ad55,
        RED_CRITICAL: 0xfc8181,
        GRAY: 0x718096,
        LIGHT_GRAY: 0xe2e8f0,
        BLUE: 0x3498db,
        DARK_GRAY: '#333333',
        MEDIUM_GRAY: '#666666',
        LIGHT_PLACEHOLDER: 0xeeeeee,
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

    // Text styling - Modern Typography
    FONT: {
        TITLE_SIZE: 40,
        OBJECTIVE_SIZE: 20,
        CARD_SIZE: 22,
        SCORE_SIZE: 16,
        CAPTION_SIZE: 12,
        FAMILY: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        WEIGHT: {
            NORMAL: '400',
            BOLD: '600',
            HEAVY: '700'
        },
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

    // Layout positioning
    LAYOUT: {
        // Score board positioning
        SCORE_TITLE_Y_OFFSET: 14,
        CURRENT_SCORE_Y_OFFSET: 34,
        CURRENT_SCORE_HEIGHT: 44,
        CALC_TEXT_Y_OFFSET: 20,
        CUMULATED_Y_OFFSET: 100,
        CUMULATED_HEIGHT: 80,

        // Health bar positioning
        HEALTH_BAR_HEIGHT: 22,
        HEALTH_BAR_GAMES_COUNTER_WIDTH: 110,
        HEALTH_HINT_Y_OFFSET: 12,
        GAMES_COUNTER_WIDTH: 150,
        GAMES_COUNTER_HEIGHT: 35,

        // Objective positioning
        OBJECTIVE_Y_OFFSET: 70,
        OBJECTIVE_WIDTH: 200,
        OBJECTIVE_HEIGHT: 50,
        OBJECTIVE_CAPTION_Y_OFFSET: 6,

        // Bar positioning
        RESULT_BAR_X_OFFSET: 40,
        RESULT_BAR_WIDTH_OFFSET: 80,
        RESULT_BAR_HEIGHT: 110,
        RESULT_BAR_Y_OFFSET: 70,
        HAND_BAR_X_OFFSET: 20,
        HAND_BAR_WIDTH_OFFSET: 40,
        HAND_BAR_HEIGHT: 110,
        HAND_BAR_Y_OFFSET: 150,
        HAND_CAPTION_Y_OFFSET: 25,

        // Border and inset values
        HEALTH_BAR_INSET: 2,
        HEALTH_BAR_BORDER: 4,

        // Text positioning
        CALC_TEXT_X_OFFSET: 16,
        CALC_TEXT_WIDTH_OFFSET: 32,

        // Test section positioning
        TEST_LABEL_X_OFFSET: 100,
        TEST_LABEL_Y_OFFSET: 75,

        // Result bar positioning
        RESULT_EQUALS_X_OFFSET: 8,
        RESULT_EQUALS_Y_OFFSET: 40,
        RESULT_EQUALS_FONT_SIZE: 30,

        // Default values
        DEFAULT_OBJECTIVE_TEXT: '> 17',
        DEFAULT_ALPHA: 0.8,

        // Health bar calculation
        HEALTH_BAR_CALC_OFFSET: 4,
    },

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


export type DifficultyMode = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
    operators: string[];
    minNumber: number;
    maxNumber: number;
    maxLevels: number;
}
export const DIFFICULTY_CONFIG: Record<DifficultyMode, DifficultyConfig> = {
    easy: {
        operators: ['+', '-'],
        minNumber: 1,
        maxNumber: 9,
        maxLevels: 5
    },
    medium: {
        operators: ['+', '-', '*', '/'],
        minNumber: 1,
        maxNumber: 9,
        maxLevels: 7
    },
    hard: {
        operators: ['+', '-', '*', '/', '^'],
        minNumber: 1,
        maxNumber: 9,
        maxLevels: 10
    }
};


