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
}

export interface RectOptions {
    fill?: number;
    alpha?: number;
    strokeColor?: number;
    strokeWidth?: number;
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
        alpha: options.alpha ?? GAME_CONFIG.ALPHA.FELT
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
        }
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
