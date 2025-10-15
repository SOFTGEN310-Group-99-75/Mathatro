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

        // Create a Phaser DOMElement wrapping the input and let Phaser manage position/scale
        const dom = this.scene.add.dom(0, 0, input) as Phaser.GameObjects.DOMElement;
        dom.setOrigin(0.5);
        dom.setDepth(1000); // above form graphics

        (input as any).__dom = dom;
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
        const dom = (input as any).__dom as Phaser.GameObjects.DOMElement | undefined;
        if (!dom) return;

        // If label is in a container, add DOMElement to the same container and position locally.
        const parentContainer = (label as any).parentContainer as Phaser.GameObjects.Container | undefined;
        if (parentContainer && (dom as any).parentContainer !== parentContainer) {
            parentContainer.add(dom);
        }

        if ((dom as any).parentContainer) {
            // Position relative to container space
            dom.setPosition(label.x, label.y + offsetY);
        } else {
            // Position in world space if no container
            const labelCenter = this.getWorldCenter(label);
            dom.setPosition(labelCenter.x, labelCenter.y + offsetY);
        }
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
            });
    }

    removeInputs(inputs: (HTMLInputElement | null)[]): void {
        inputs
            .filter((i): i is HTMLInputElement => !!i)
            .forEach(input => {
                const dom = (input as any).__dom as Phaser.GameObjects.DOMElement | undefined;
                dom?.destroy();
            });
    }

    private setInputVisibility(input: HTMLInputElement | null, visible: boolean) {
        if (!input) return;
        const dom = (input as any).__dom as Phaser.GameObjects.DOMElement | undefined;
        if (dom) dom.setVisible(visible);
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
