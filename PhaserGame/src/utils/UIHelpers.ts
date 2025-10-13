import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConstants';

/**
 * UI Helper utilities to reduce code duplication across scenes
 */

export interface LabelBoxOptions {
    fill?: number;
    alpha?: number;
    fontSize?: number;
    color?: string;
    fontStyle?: string;
    align?: string;
    bg?: string;
    radius?: number;
}

export interface CardOptions extends LabelBoxOptions {
    draggable?: boolean;
}

export interface RectOptions {
    fill?: number;
    alpha?: number;
    strokeColor?: number;
    strokeWidth?: number;
    radius?: number;
    gradient?: {
        from: number;
        to: number;
        direction: 'horizontal' | 'vertical';
    };
}

/**
 * Creates a styled rectangle with consistent styling
 */
export const createStyledRect = (
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    options: RectOptions = {}
) => {
    // If radius or gradient is specified, use Graphics for advanced styling
    if ((options.radius && options.radius > 0) || options.gradient) {
        const graphics = scene.add.graphics();

        if (options.gradient) {
            // Create gradient effect using multiple overlapping rectangles
            const gradientSteps = 5;
            const stepHeight = h / gradientSteps;

            for (let i = 0; i < gradientSteps; i++) {
                const stepY = y + (i * stepHeight);
                const stepAlpha = (options.alpha ?? GAME_CONFIG.ALPHA.FELT) * (1 - (i * 0.1));
                const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                    Phaser.Display.Color.IntegerToColor(options.gradient.from),
                    Phaser.Display.Color.IntegerToColor(options.gradient.to),
                    gradientSteps,
                    i
                );
                const stepColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

                graphics.fillStyle(stepColor, stepAlpha);
                if (options.radius) {
                    graphics.fillRoundedRect(x, stepY, w, stepHeight + 1, options.radius);
                } else {
                    graphics.fillRect(x, stepY, w, stepHeight + 1);
                }
            }
        } else {
            graphics.fillStyle(
                options.fill ?? GAME_CONFIG.COLORS.GREEN_FELT,
                options.alpha ?? GAME_CONFIG.ALPHA.FELT
            );

            if (options.radius) {
                graphics.fillRoundedRect(x, y, w, h, options.radius);
            } else {
                graphics.fillRect(x, y, w, h);
            }
        }

        graphics.lineStyle(
            options.strokeWidth ?? 2,
            options.strokeColor ?? 0xffffff,
            0.7
        );

        if (options.radius) {
            graphics.strokeRoundedRect(x, y, w, h, options.radius);
        } else {
            graphics.strokeRect(x, y, w, h);
        }

        return graphics;
    }

    // Otherwise use regular rectangle
    const rect = scene.add.rectangle(
        x, y, w, h,
        options.fill ?? GAME_CONFIG.COLORS.GREEN_FELT,
        options.alpha ?? GAME_CONFIG.ALPHA.FELT
    ).setOrigin(0, 0);

    rect.setStrokeStyle(
        options.strokeWidth ?? 2,
        options.strokeColor ?? 0xffffff,
        0.7
    );

    return rect;
};

/**
 * Creates a label box with consistent styling
 */
export const createLabelBox = (
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    options: LabelBoxOptions = {}
) => {
    const group = scene.add.container(x, y);
    const box = createStyledRect(scene, 0, 0, w, h, {
        fill: options.fill ?? GAME_CONFIG.COLORS.GREEN_FELT,
        alpha: options.alpha ?? GAME_CONFIG.ALPHA.FELT,
        radius: options.radius
    });

    const textObj = scene.add.text(w / 2, h / 2, text, {
        fontSize: options.fontSize ?? GAME_CONFIG.FONT.SCORE_SIZE,
        color: options.color ?? GAME_CONFIG.COLORS.WHITE,
        fontStyle: options.fontStyle ?? 'bold',
        align: options.align ?? 'center',
        backgroundColor: options.bg ?? undefined,
        stroke: GAME_CONFIG.FONT.STROKE_COLOR,
        strokeThickness: 2,
        shadow: {
            offsetX: GAME_CONFIG.FONT.SHADOW_OFFSET_X,
            offsetY: GAME_CONFIG.FONT.SHADOW_OFFSET_Y,
            color: GAME_CONFIG.COLORS.BLACK,
            blur: GAME_CONFIG.FONT.SHADOW_BLUR,
            fill: true
        },
        wordWrap: { width: w - 10, useAdvancedWrap: true }
    }).setOrigin(0.5);

    group.add([box, textObj]);
    return { group, box, text: textObj };
};

/**
 * Creates a title text with consistent styling
 */
export const createTitleText = (
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    options: Partial<LabelBoxOptions> = {}
) => {
    return scene.add.text(x, y, text, {
        align: "center",
        strokeThickness: GAME_CONFIG.FONT.STROKE_THICKNESS,
        fontSize: options.fontSize ?? GAME_CONFIG.FONT.TITLE_SIZE,
        fontStyle: "bold",
        color: options.color ?? GAME_CONFIG.COLORS.PURPLE
    }).setOrigin(0.5);
};

/**
 * Creates an animated title with hover effects
 */
export const createAnimatedTitle = (
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onComplete?: () => void
) => {
    const titleText = createTitleText(scene, x, y, text);
    titleText.setDepth(3).setInteractive();

    // Pulsing animation
    scene.add.tween({
        targets: titleText,
        duration: GAME_CONFIG.ANIMATION.TWEEN_DURATION,
        ease: (value: number) => (value > 0.8),
        alpha: 0,
        repeat: -1,
        yoyo: true,
    });

    // Hover effects
    titleText.on(Phaser.Input.Events.POINTER_OVER, () => {
        titleText.setColor(GAME_CONFIG.COLORS.LIGHT_PURPLE);
        scene.input.setDefaultCursor("pointer");
    });

    titleText.on(Phaser.Input.Events.POINTER_OUT, () => {
        titleText.setColor(GAME_CONFIG.COLORS.PURPLE);
        scene.input.setDefaultCursor("default");
    });

    // Click handler
    titleText.on(Phaser.Input.Events.POINTER_DOWN, () => {
        scene.sound.play("whoosh", { volume: GAME_CONFIG.AUDIO.WHOOSH_VOLUME });
        scene.add.tween({
            targets: titleText,
            ease: Phaser.Math.Easing[GAME_CONFIG.ANIMATION.BOUNCE_EASING],
            y: -1000,
            onComplete
        });
    });

    return titleText;
};

/**
 * Creates a volume button with consistent styling
 */
export const createVolumeButton = (scene: Phaser.Scene) => {
    const volumeIcon = scene.add.image(25, 25, "volume-icon").setName("volume-icon");
    volumeIcon.setInteractive();

    // Hover effects
    volumeIcon.on(Phaser.Input.Events.POINTER_OVER, () => {
        scene.input.setDefaultCursor("pointer");
    });

    volumeIcon.on(Phaser.Input.Events.POINTER_OUT, () => {
        scene.input.setDefaultCursor("default");
    });

    // Click handler
    volumeIcon.on(Phaser.Input.Events.POINTER_DOWN, () => {
        if (scene.sound.volume === 0) {
            scene.sound.setVolume(1);
            volumeIcon.setTexture("volume-icon");
            volumeIcon.setAlpha(1);
        } else {
            scene.sound.setVolume(0);
            volumeIcon.setTexture("volume-icon_off");
            volumeIcon.setAlpha(GAME_CONFIG.ALPHA.VOLUME_OFF);
        }
    });

    return volumeIcon;
};

/**
 * Creates a styled text with consistent styling
 */
export const createStyledText = (
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    options: Partial<LabelBoxOptions> = {}
) => {
    return scene.add.text(x, y, text, {
        fontSize: options.fontSize ?? GAME_CONFIG.FONT.SCORE_SIZE,
        color: options.color ?? GAME_CONFIG.COLORS.BLACK,
        fontStyle: options.fontStyle ?? '500',
        fontFamily: GAME_CONFIG.FONT.FAMILY,
        align: options.align ?? 'center',
        stroke: GAME_CONFIG.FONT.STROKE_COLOR,
        strokeThickness: 2,
        shadow: {
            offsetX: GAME_CONFIG.FONT.SHADOW_OFFSET_X,
            offsetY: GAME_CONFIG.FONT.SHADOW_OFFSET_Y,
            color: GAME_CONFIG.COLORS.BLACK,
            blur: GAME_CONFIG.FONT.SHADOW_BLUR,
            fill: true
        }
    }).setOrigin(0.5);
};

/**
 * Creates a styled card with consistent styling
 */
export const createStyledCard = (
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string = '',
    options: CardOptions = {}
) => {
    const { draggable = false } = options;
    const group = scene.add.container(x, y);

    // Enhanced shadow with blur effect
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, GAME_CONFIG.CARD_SHADOW_ALPHA * 1.5);
    shadow.fillRoundedRect(
        GAME_CONFIG.CARD_SHADOW_OFFSET_X,
        GAME_CONFIG.CARD_SHADOW_OFFSET_Y,
        w, h,
        8 // Rounded shadow to match card
    );

    // Card background with modern styling
    const card = scene.add.graphics();
    card.fillStyle(options.fill ?? 0xffffff, options.alpha ?? 1);
    card.lineStyle(2, GAME_CONFIG.COLORS.DEEP_PURPLE, 0.8);
    card.fillRoundedRect(0, 0, w, h, 8);
    card.strokeRoundedRect(0, 0, w, h, 8);

    // Text with modern typography and Inter font
    const text = scene.add.text(w / 2, h / 2, label, {
        fontSize: options.fontSize ?? GAME_CONFIG.FONT.CARD_SIZE,
        color: options.color ?? '#4a5568',
        fontStyle: options.fontStyle ?? '600',
        fontFamily: GAME_CONFIG.FONT.FAMILY,
        stroke: GAME_CONFIG.FONT.STROKE_COLOR,
        strokeThickness: 1,
        shadow: {
            offsetX: GAME_CONFIG.FONT.SHADOW_OFFSET_X,
            offsetY: GAME_CONFIG.FONT.SHADOW_OFFSET_Y,
            color: '#ffffff',
            blur: GAME_CONFIG.FONT.SHADOW_BLUR,
            fill: true
        }
    }).setOrigin(0.5);

    group.add([shadow, card, text]);
    (group as any).shadow = shadow;
    (group as any).slot = null;
    (group as any).card = card;
    (group as any).text = text;

    // Add hover effects and drag functionality
    if (draggable) {
        group.setSize(w, h);
        group.setInteractive(
            new Phaser.Geom.Rectangle(w / 2, h / 2, w, h),
            Phaser.Geom.Rectangle.Contains
        );
        scene.input.setDraggable(group);

        // Add hover effects for better interactivity
        group.on('pointerover', () => {
            // Slightly scale up and enhance shadow
            group.setScale(1.05);
            shadow.setAlpha(GAME_CONFIG.CARD_SHADOW_ALPHA * 2);
        });

        group.on('pointerout', () => {
            // Reset scale and shadow
            group.setScale(1);
            shadow.setAlpha(GAME_CONFIG.CARD_SHADOW_ALPHA * 1.5);
        });

        group.on('pointerdown', () => {
            // Slightly scale down for press effect
            group.setScale(0.98);
        });

        group.on('pointerup', () => {
            // Reset to hover state
            group.setScale(1.05);
        });
    }

    return group;
};

/**
 * Creates a standardized game card
 */
export const createGameCard = (
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    draggable: boolean = true
) => {
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
};

/**
 * Makes an element interactive with hover effects
 */
export const makeInteractive = (
    element: Phaser.GameObjects.GameObject & { setColor?: (color: string) => any },
    hoverColor: string,
    originalColor: string,
    scene: Phaser.Scene
) => {
    element.setInteractive();

    element.on(Phaser.Input.Events.POINTER_OVER, () => {
        if (element.setColor) {
            element.setColor(hoverColor);
        }
        scene.input.setDefaultCursor("pointer");
    });

    element.on(Phaser.Input.Events.POINTER_OUT, () => {
        if (element.setColor) {
            element.setColor(originalColor);
        }
        scene.input.setDefaultCursor("default");
    });

    return element;
};

/**
 * Creates a styled container with consistent styling
 */
export const createStyledContainer = (
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    options: RectOptions = {}
) => {
    const group = scene.add.container(x, y);
    const rect = createStyledRect(scene, 0, 0, w, h, options);
    group.add(rect);
    return group;
};
