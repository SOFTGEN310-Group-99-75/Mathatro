import Phaser from 'phaser';

/**
 * Manages responsive dimensions, world→screen conversion, and precise input positioning
 * anchored to label world centers (DPI & zoom aware).
 */
export class ResponsiveFormManager {
    private readonly scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    // Dynamic responsive dimensions
    getDimensions() {
        const gameWidth = this.scene.sys.game.scale.width;

        const formWidth = Math.max(300, Math.min(500, gameWidth * 0.8));
        const inputWidth = Math.max(240, Math.min(380, formWidth * 0.8));
        const buttonWidth = Math.max(200, Math.min(350, formWidth * 0.7));

        const scale = Math.max(0.8, Math.min(1.2, gameWidth / 800));
        const height = Math.round(45 * scale);
        const fontSize = Math.max(14, Math.min(18, Math.round(16 * scale)));
        const formHeight = Math.round(320 * scale);
        const formRadius = Math.max(10, Math.min(18, Math.round(12 * scale)));
        const buttonH = Math.round(45 * scale);
        const buttonR = Math.max(8, Math.min(12, Math.round(10 * scale)));

        return {
            width: inputWidth,
            height,
            fontSize,
            formWidth,
            formHeight,
            formRadius,
            buttonWidth,
            buttonHeight: buttonH,
            buttonRadius: buttonR
        };
    }

    /**
     * Create a styled HTML input. We use a wrapper absolutely positioned over the canvas.
     * The input is centered around the target point by positionInputAtLabel().
     */
    createHTMLInput(type: string, placeholder: string): HTMLInputElement {
        const input = document.createElement('input');
        const { width, height, fontSize } = this.getDimensions();

        input.type = type;
        input.placeholder = placeholder;

        Object.assign(input.style, {
            position: 'relative',  // relative to wrapper
            left: '0px',
            top: '0px',
            width: `${width}px`,
            height: `${height}px`,
            fontSize: `${fontSize}px`,
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: '400',
            backgroundColor: '#ffffff',
            color: '#2d3748',
            outline: 'none',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease-in-out',
            boxSizing: 'border-box',
            display: 'block',
            pointerEvents: 'auto'
        } as CSSStyleDeclaration);

        input.addEventListener('focus', () =>
            Object.assign(input.style, {
                borderColor: '#4c51bf',
                boxShadow: '0 0 0 3px rgba(76,81,191,0.1), 0 8px 16px rgba(0,0,0,0.12)'
            })
        );
        input.addEventListener('blur', () =>
            Object.assign(input.style, {
                borderColor: '#e2e8f0',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)'
            })
        );

        // Absolutely-positioned wrapper overlays the canvas
        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, {
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: `${width}px`,
            height: `${height}px`,
            zIndex: '1000',
            pointerEvents: 'none' // wrapper clicks pass through; input handles events
        } as CSSStyleDeclaration);

        wrapper.appendChild(input);
        document.body.appendChild(wrapper);

        (input as any).__wrapper = wrapper;
        return input;
    }

    /**
     * Convert world → CSS screen pixels (DPI aware).
     * Uses canvas internal size vs CSS rect to compute ratios correctly.
     */
    worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
        const cam = this.scene.cameras.main;
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();

        // Internal pixels
        const internalX = (worldX - cam.worldView.x) * cam.zoom;
        const internalY = (worldY - cam.worldView.y) * cam.zoom;

        // Map internal → CSS pixels using actual CSS scale
        const xRatio = rect.width / canvas.width;
        const yRatio = rect.height / canvas.height;

        return {
            x: rect.left + internalX * xRatio,
            y: rect.top + internalY * yRatio
        };
    }

    /**
     * Get world center of a display object via its world-space bounds.
     */
    private getWorldCenter(obj: Phaser.GameObjects.GameObject): { x: number; y: number } {
        const bounds = (obj as any).getBounds ? (obj as any).getBounds() : null;
        if (bounds) {
            return { x: bounds.centerX, y: bounds.centerY };
        }
        // Fallback: assume it's a GameObject with x/y in world space
        const go = obj as any;
        return { x: go.x ?? 0, y: go.y ?? 0 };
    }

    /**
     * Center the input at (label world center + offsetY downwards).
     * The input's wrapper is placed with its top-left computed from center minus half width/height.
     */
    positionInputAtLabel(input: HTMLInputElement, label: Phaser.GameObjects.Text, offsetY: number) {
        const { width, height } = this.getDimensions();
        const labelCenter = this.getWorldCenter(label);
        const targetWorldX = labelCenter.x;
        const targetWorldY = labelCenter.y + offsetY;

        const screen = this.worldToScreen(targetWorldX, targetWorldY);
        const wrapper = (input as any).__wrapper as HTMLDivElement | undefined;
        if (!wrapper) return;

        Object.assign(wrapper.style, {
            left: `${screen.x - width / 2}px`,
            top: `${screen.y - height / 2}px`,
            width: `${width}px`,
            height: `${height}px`
        } as CSSStyleDeclaration);

        // Ensure input is at (0,0) inside wrapper
        Object.assign(input.style, { position: 'relative', left: '0px', top: '0px' } as CSSStyleDeclaration);
    }

    updateInputDimensions(inputs: (HTMLInputElement | null)[]): void {
        const { width, height, fontSize } = this.getDimensions();
        inputs
            .filter((i): i is HTMLInputElement => !!i)
            .forEach(input => {
                Object.assign(input.style, {
                    width: `${width}px`,
                    height: `${height}px`,
                    fontSize: `${fontSize}px`
                } as CSSStyleDeclaration);

                const wrapper = (input as any).__wrapper as HTMLDivElement | undefined;
                if (wrapper) {
                    Object.assign(wrapper.style, {
                        width: `${width}px`,
                        height: `${height}px`
                    } as CSSStyleDeclaration);
                }
            });
    }

    removeInputs(inputs: (HTMLInputElement | null)[]): void {
        inputs
            .filter((i): i is HTMLInputElement => !!i)
            .forEach(input => {
                const wrapper = (input as any).__wrapper as HTMLDivElement | undefined;
                wrapper?.parentNode?.removeChild(wrapper);
            });
    }

    private setInputVisibility(input: HTMLInputElement | null, visible: boolean) {
        if (!input) return;
        const wrapper = (input as any).__wrapper as HTMLDivElement | undefined;
        if (wrapper) wrapper.style.display = visible ? 'block' : 'none';
        input.style.display = visible ? 'block' : 'none';
    }

    /** LOGIN layout: inputs below their labels by a fixed rhythm */
    updateLoginInputPositions(
        usernameInput: HTMLInputElement | null,
        passwordInput: HTMLInputElement | null,
        signupInputs: { username: HTMLInputElement | null; email: HTMLInputElement | null; password: HTMLInputElement | null },
        usernameLabel: Phaser.GameObjects.Text,
        passwordLabel: Phaser.GameObjects.Text
    ): void {
        const BELOW = 32; // px below label center to input center (consistent rhythm)

        // Show login inputs
        this.setInputVisibility(usernameInput, true);
        this.setInputVisibility(passwordInput, true);

        if (usernameInput) this.positionInputAtLabel(usernameInput, usernameLabel, BELOW);
        if (passwordInput) this.positionInputAtLabel(passwordInput, passwordLabel, BELOW);

        // Hide signup inputs
        this.setInputVisibility(signupInputs.username, false);
        this.setInputVisibility(signupInputs.email, false);
        this.setInputVisibility(signupInputs.password, false);
    }

    /** SIGNUP layout: inputs below their labels by a fixed rhythm */
    updateSignupInputPositions(
        signupInputs: { username: HTMLInputElement | null; email: HTMLInputElement | null; password: HTMLInputElement | null },
        loginInputs: { username: HTMLInputElement | null; password: HTMLInputElement | null },
        emailLabel: Phaser.GameObjects.Text,
        usernameLabel: Phaser.GameObjects.Text,
        passwordLabel: Phaser.GameObjects.Text
    ): void {
        const BELOW = 32;

        // Show signup inputs
        this.setInputVisibility(signupInputs.email, true);
        this.setInputVisibility(signupInputs.username, true);
        this.setInputVisibility(signupInputs.password, true);

        if (signupInputs.email) this.positionInputAtLabel(signupInputs.email, emailLabel, BELOW);
        if (signupInputs.username) this.positionInputAtLabel(signupInputs.username, usernameLabel, BELOW);
        if (signupInputs.password) this.positionInputAtLabel(signupInputs.password, passwordLabel, BELOW);

        // Hide login inputs
        this.setInputVisibility(loginInputs.username, false);
        this.setInputVisibility(loginInputs.password, false);
    }
}
