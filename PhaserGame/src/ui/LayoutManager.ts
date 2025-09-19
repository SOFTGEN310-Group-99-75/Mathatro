import { GAME_CONFIG } from '../config/GameConstants';

// Type definitions
interface Position {
    x: number;
    y: number;
}

interface SlotLayout {
    positions: Position[];
    cardWidth: number;
    cardHeight: number;
    gap: number;
}

interface HealthBarLayout {
    backgroundX: number;
    backgroundY: number;
    backgroundWidth: number;
    backgroundHeight: number;
    fillX: number;
    fillY: number;
    fillWidth: number;
    fillHeight: number;
}

interface GamesCounterLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ObjectiveLayout {
    x: number;
    y: number;
    width: number;
    height: number;
    captionX: number;
    captionY: number;
}

interface BarLayout {
    x: number;
    y: number;
    width: number;
    height: number;
    captionX?: number;
    captionY?: number;
    equalsX?: number;
    equalsY?: number;
}

interface SidebarLayout {
    x: number;
    y: number;
    width: number;
    height: number;
    scoreTitleX: number;
    scoreTitleY: number;
    currentScoreX: number;
    currentScoreY: number;
    currentScoreWidth: number;
    currentScoreHeight: number;
    calcTextX: number;
    calcTextY: number;
    cumulatedX: number;
    cumulatedY: number;
    cumulatedWidth: number;
    cumulatedHeight: number;
}

interface MainAreaDimensions {
    mainWidth: number;
    mainX: number;
    sidebarWidth: number;
    deckWidth: number;
    margin: number;
}

interface CompleteLayout {
    mainArea: MainAreaDimensions;
    sidebar: SidebarLayout;
    healthBar: HealthBarLayout;
    gamesCounter: GamesCounterLayout;
    objective: ObjectiveLayout;
    resultBar: BarLayout;
    handBar: BarLayout;
    testSection: Position;
}

/**
 * LayoutManager - Handles all UI positioning and layout calculations
 * Separated from game logic for better maintainability and reusability
 */
export class LayoutManager {
    /**
     * Calculate positions for hand slots
     */
    static calculateHandSlotPositions(containerWidth: number, containerHeight: number, slotCount: number): SlotLayout {
        const innerPad = GAME_CONFIG.INNER_PADDING;
        const cardW = GAME_CONFIG.CARD_WIDTH;
        const cardH = GAME_CONFIG.CARD_HEIGHT;
        const innerW = containerWidth - innerPad * 2;
        const gap = Math.max(GAME_CONFIG.CARD_GAP, (innerW - slotCount * cardW) / (slotCount + 1));

        const positions: Position[] = [];
        let x = innerPad + gap;
        const y = (containerHeight - cardH) / 2;

        for (let i = 0; i < slotCount; i++) {
            positions.push({ x, y });
            x += cardW + gap;
        }

        return {
            positions,
            cardWidth: cardW,
            cardHeight: cardH,
            gap
        };
    }

    /**
     * Calculate positions for result slots
     */
    static calculateResultSlotPositions(containerWidth: number, containerHeight: number, slotCount: number): SlotLayout {
        return this.calculateHandSlotPositions(containerWidth, containerHeight, slotCount);
    }

    /**
     * Calculate main game area dimensions
     */
    static calculateMainAreaDimensions(gameWidth: number, gameHeight: number): MainAreaDimensions {
        const M = GAME_CONFIG.MARGIN;
        const SIDEBAR_W = GAME_CONFIG.SIDEBAR_WIDTH;
        const DECK_W = GAME_CONFIG.DECK_WIDTH;

        return {
            mainWidth: gameWidth - SIDEBAR_W - DECK_W - (M * 4),
            mainX: SIDEBAR_W + (M * 2),
            sidebarWidth: SIDEBAR_W,
            deckWidth: DECK_W,
            margin: M
        };
    }

    /**
     * Calculate health bar dimensions and positioning
     */
    static calculateHealthBarLayout(mainX: number, mainY: number, mainWidth: number): HealthBarLayout {
        return {
            backgroundX: mainX,
            backgroundY: mainY,
            backgroundWidth: mainWidth - GAME_CONFIG.LAYOUT.HEALTH_BAR_GAMES_COUNTER_WIDTH,
            backgroundHeight: GAME_CONFIG.LAYOUT.HEALTH_BAR_HEIGHT,
            fillX: mainX + GAME_CONFIG.LAYOUT.HEALTH_BAR_INSET,
            fillY: mainY + GAME_CONFIG.LAYOUT.HEALTH_BAR_INSET,
            fillWidth: (mainWidth - GAME_CONFIG.LAYOUT.HEALTH_BAR_GAMES_COUNTER_WIDTH) - GAME_CONFIG.LAYOUT.HEALTH_BAR_BORDER,
            fillHeight: GAME_CONFIG.LAYOUT.HEALTH_BAR_HEIGHT - GAME_CONFIG.LAYOUT.HEALTH_BAR_BORDER
        };
    }

    /**
     * Calculate games counter positioning
     */
    static calculateGamesCounterLayout(mainX: number, mainY: number, mainWidth: number): GamesCounterLayout {
        return {
            x: mainX + mainWidth - GAME_CONFIG.LAYOUT.GAMES_COUNTER_WIDTH,
            y: mainY,
            width: GAME_CONFIG.LAYOUT.GAMES_COUNTER_WIDTH,
            height: GAME_CONFIG.LAYOUT.GAMES_COUNTER_HEIGHT
        };
    }

    /**
     * Calculate objective display positioning
     */
    static calculateObjectiveLayout(mainX: number, mainY: number, mainWidth: number): ObjectiveLayout {
        return {
            x: mainX + mainWidth / 2 - GAME_CONFIG.LAYOUT.OBJECTIVE_WIDTH / 2,
            y: mainY + GAME_CONFIG.LAYOUT.OBJECTIVE_Y_OFFSET,
            width: GAME_CONFIG.LAYOUT.OBJECTIVE_WIDTH,
            height: GAME_CONFIG.LAYOUT.OBJECTIVE_HEIGHT,
            captionX: mainX + mainWidth / 2,
            captionY: mainY + GAME_CONFIG.LAYOUT.OBJECTIVE_Y_OFFSET - GAME_CONFIG.LAYOUT.OBJECTIVE_CAPTION_Y_OFFSET
        };
    }

    /**
     * Calculate result bar positioning
     */
    static calculateResultBarLayout(mainX: number, objectiveY: number, mainWidth: number): BarLayout {
        return {
            x: mainX + GAME_CONFIG.LAYOUT.RESULT_BAR_X_OFFSET,
            y: objectiveY + GAME_CONFIG.LAYOUT.RESULT_BAR_Y_OFFSET,
            width: mainWidth - GAME_CONFIG.LAYOUT.RESULT_BAR_WIDTH_OFFSET,
            height: GAME_CONFIG.LAYOUT.RESULT_BAR_HEIGHT,
            equalsX: mainX + GAME_CONFIG.LAYOUT.RESULT_BAR_X_OFFSET + (mainWidth - GAME_CONFIG.LAYOUT.RESULT_BAR_WIDTH_OFFSET) + GAME_CONFIG.LAYOUT.RESULT_EQUALS_X_OFFSET,
            equalsY: objectiveY + GAME_CONFIG.LAYOUT.RESULT_BAR_Y_OFFSET + GAME_CONFIG.LAYOUT.RESULT_EQUALS_Y_OFFSET
        };
    }

    /**
     * Calculate hand bar positioning
     */
    static calculateHandBarLayout(mainX: number, resultBarY: number, mainWidth: number): BarLayout {
        return {
            x: mainX + GAME_CONFIG.LAYOUT.HAND_BAR_X_OFFSET,
            y: resultBarY + GAME_CONFIG.LAYOUT.HAND_BAR_Y_OFFSET,
            width: mainWidth - GAME_CONFIG.LAYOUT.HAND_BAR_WIDTH_OFFSET,
            height: GAME_CONFIG.LAYOUT.HAND_BAR_HEIGHT,
            captionX: mainX + GAME_CONFIG.LAYOUT.HAND_BAR_X_OFFSET + (mainWidth - GAME_CONFIG.LAYOUT.HAND_BAR_WIDTH_OFFSET) / 2,
            captionY: resultBarY + GAME_CONFIG.LAYOUT.HAND_BAR_Y_OFFSET + GAME_CONFIG.LAYOUT.HAND_BAR_HEIGHT + GAME_CONFIG.LAYOUT.HAND_CAPTION_Y_OFFSET
        };
    }

    /**
     * Calculate sidebar layout
     */
    static calculateSidebarLayout(gameWidth: number, gameHeight: number): SidebarLayout {
        const M = GAME_CONFIG.MARGIN;
        const SIDEBAR_W = GAME_CONFIG.SIDEBAR_WIDTH;

        return {
            x: M,
            y: M,
            width: SIDEBAR_W,
            height: gameHeight - M * 2,
            scoreTitleX: M + SIDEBAR_W / 2,
            scoreTitleY: M + GAME_CONFIG.LAYOUT.SCORE_TITLE_Y_OFFSET,
            currentScoreX: M + GAME_CONFIG.INNER_PADDING,
            currentScoreY: M + GAME_CONFIG.LAYOUT.CURRENT_SCORE_Y_OFFSET,
            currentScoreWidth: SIDEBAR_W - GAME_CONFIG.INNER_PADDING * 2,
            currentScoreHeight: GAME_CONFIG.LAYOUT.CURRENT_SCORE_HEIGHT,
            calcTextX: M + GAME_CONFIG.LAYOUT.CALC_TEXT_X_OFFSET,
            calcTextY: M + GAME_CONFIG.LAYOUT.CURRENT_SCORE_Y_OFFSET + GAME_CONFIG.LAYOUT.CURRENT_SCORE_HEIGHT + GAME_CONFIG.LAYOUT.CALC_TEXT_Y_OFFSET,
            cumulatedX: M + GAME_CONFIG.INNER_PADDING + 20,
            cumulatedY: gameHeight - M - GAME_CONFIG.LAYOUT.CUMULATED_Y_OFFSET,
            cumulatedWidth: SIDEBAR_W - GAME_CONFIG.INNER_PADDING * 2,
            cumulatedHeight: GAME_CONFIG.LAYOUT.CUMULATED_HEIGHT
        };
    }

    /**
     * Calculate test section positioning
     */
    static calculateTestSectionLayout(mainX: number, mainY: number, mainWidth: number): Position {
        return {
            x: mainX + mainWidth / 2 + GAME_CONFIG.LAYOUT.TEST_LABEL_X_OFFSET,
            y: mainY + GAME_CONFIG.LAYOUT.TEST_LABEL_Y_OFFSET
        };
    }

    /**
     * Get all layout calculations for a complete UI setup
     */
    static calculateCompleteLayout(gameWidth: number, gameHeight: number): CompleteLayout {
        const mainArea = this.calculateMainAreaDimensions(gameWidth, gameHeight);
        const sidebar = this.calculateSidebarLayout(gameWidth, gameHeight);
        const healthBar = this.calculateHealthBarLayout(mainArea.mainX, mainArea.margin, mainArea.mainWidth);
        const gamesCounter = this.calculateGamesCounterLayout(mainArea.mainX, mainArea.margin, mainArea.mainWidth);
        const objective = this.calculateObjectiveLayout(mainArea.mainX, mainArea.margin, mainArea.mainWidth);
        const resultBar = this.calculateResultBarLayout(mainArea.mainX, objective.y, mainArea.mainWidth);
        const handBar = this.calculateHandBarLayout(mainArea.mainX, resultBar.y, mainArea.mainWidth);
        const testSection = this.calculateTestSectionLayout(mainArea.mainX, mainArea.margin, mainArea.mainWidth);

        return {
            mainArea,
            sidebar,
            healthBar,
            gamesCounter,
            objective,
            resultBar,
            handBar,
            testSection
        };
    }
}
