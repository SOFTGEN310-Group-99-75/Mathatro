import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConstants';

/**
 * StyleHelpers - Centralized styling utilities to reduce code duplication
 */
export class StyleHelpers {
    /**
     * Creates a consistent text style object with Inter font family
     */
    static createTextStyle(options: {
        fontSize?: string;
        color?: string;
        fontStyle?: string;
        fontFamily?: string;
    } = {}): Phaser.Types.GameObjects.Text.TextStyle {
        return {
            fontSize: options.fontSize ?? '16px',
            color: options.color ?? '#000000',
            fontStyle: options.fontStyle ?? '400',
            fontFamily: options.fontFamily ?? GAME_CONFIG.FONT.FAMILY
        };
    }

    /**
     * Creates a title text style with consistent styling across the app
     */
    static createTitleTextStyle(fontSize: string = '52px'): Phaser.Types.GameObjects.Text.TextStyle {
        return {
            fontSize,
            color: '#7c3aed',
            fontStyle: '800',
            fontFamily: GAME_CONFIG.FONT.FAMILY
        };
    }

    /**
     * Applies consistent title styling to a text object
     */
    static applyTitleStyle(textObj: Phaser.GameObjects.Text): void {
        textObj.setStroke('#ffffff', 3);
        textObj.setShadow(4, 4, '#000000', 0.5);
    }

    /**
     * Creates a button text style with consistent font weight
     */
    static createButtonTextStyle(fontWeight: string = '600'): Phaser.Types.GameObjects.Text.TextStyle {
        return {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: fontWeight,
            fontFamily: GAME_CONFIG.FONT.FAMILY
        };
    }

    /**
     * Creates a label text style for UI labels
     */
    static createLabelTextStyle(fontWeight: string = '500'): Phaser.Types.GameObjects.Text.TextStyle {
        return {
            fontSize: '16px',
            color: '#2d3748',
            fontStyle: fontWeight,
            fontFamily: GAME_CONFIG.FONT.FAMILY
        };
    }

    /**
     * Creates a rounded rectangle graphics object with consistent styling
     */
    static createRoundedRect(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        options: {
            fill?: number;
            stroke?: number;
            strokeWidth?: number;
            radius?: number;
            alpha?: number;
        } = {}
    ): Phaser.GameObjects.Graphics {
        const graphics = scene.add.graphics();

        // Set fill and stroke
        if (options.fill !== undefined) {
            graphics.fillStyle(options.fill, options.alpha ?? 1);
        }
        if (options.stroke !== undefined) {
            graphics.lineStyle(options.strokeWidth ?? 2, options.stroke);
        }

        // Draw rounded rectangle
        const radius = options.radius ?? 8;
        graphics.fillRoundedRect(x, y, width, height, radius);
        if (options.stroke !== undefined) {
            graphics.strokeRoundedRect(x, y, width, height, radius);
        }

        return graphics;
    }

    /**
     * Creates a glass morphism effect on a graphics object
     */
    static applyGlassMorphism(graphics: Phaser.GameObjects.Graphics): void {
        graphics.setAlpha(0.9);
        graphics.lineStyle(2, 0xffffff, 0.3);
    }

    /**
     * Creates hover effect configuration for interactive elements
     */
    static createHoverEffect(): {
        onHover: (target: any) => void;
        onOut: (target: any) => void;
    } {
        return {
            onHover: (target: any) => {
                if (target.setScale) {
                    target.setScale(1.05);
                }
                if (target.setTint) {
                    target.setTint(0xcccccc);
                }
            },
            onOut: (target: any) => {
                if (target.setScale) {
                    target.setScale(1);
                }
                if (target.clearTint) {
                    target.clearTint();
                }
            }
        };
    }
}
