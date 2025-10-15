import Phaser from 'phaser';
import { AuthService } from './AuthService';
import { GAME_CONFIG } from '../config/GameConstants';
import { createTitleText } from '../utils/UIHelpers';
import { StyleHelpers } from '../utils/StyleHelpers';
import { ResponsiveFormManager } from './ResponsiveFormManager';

export class LoginScene extends Phaser.Scene {
    private authService!: AuthService;
    private readonly formManager: ResponsiveFormManager;
    private loginContainer!: Phaser.GameObjects.Container;
    private signupContainer!: Phaser.GameObjects.Container;

    // HTML inputs
    private usernameInput: HTMLInputElement | null = null;
    private passwordInput: HTMLInputElement | null = null;
    private signupUsernameInput: HTMLInputElement | null = null;
    private signupEmailInput: HTMLInputElement | null = null;
    private signupPasswordInput: HTMLInputElement | null = null;

    // Labels (anchor points for inputs)
    private loginUsernameLabel!: Phaser.GameObjects.Text;
    private loginPasswordLabel!: Phaser.GameObjects.Text;
    private signupEmailLabel!: Phaser.GameObjects.Text;
    private signupUsernameLabel!: Phaser.GameObjects.Text;
    private signupPasswordLabel!: Phaser.GameObjects.Text;

    // UI text
    private errorText!: Phaser.GameObjects.Text;
    private loadingText!: Phaser.GameObjects.Text;

    private isSignUpMode = false;

    // listeners
    private resizeHandler: (() => void) | null = null;
    private cameraHandler: (() => void) | null = null;

    private static readonly PASSWORD_PLACEHOLDER = 'Enter your password';
    private static readonly USERNAME_PLACEHOLDER = 'Enter your username';
    private static readonly EMAIL_PLACEHOLDER = 'Enter your email';

    constructor() {
        super({ key: 'LoginScene' });
        this.formManager = new ResponsiveFormManager(this);
    }

    init() {
        this.isSignUpMode = false;
    }

    create() {
        const { width: W, height: H } = this.sys.game.scale;
        this.authService = AuthService.getInstance();

        // Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x4facfe, 0x4facfe, 0x00f2fe, 0x00f2fe, 1);
        bg.fillRect(0, 0, W, H);

        // Title + subtitle
        createTitleText(this, W / 2, H * 0.15, 'Mathatro', { fontSize: 52 });
        this.add.text(
            W / 2, H * 0.23, 'It\'s a piece of π!',
            StyleHelpers.createTextStyle({ fontSize: '22px', color: '#ffffff', fontStyle: '500' })
        ).setOrigin(0.5);

        // Containers
        this.loginContainer = this.add.container(W / 2, H * 0.6);
        this.signupContainer = this.add.container(W / 2, H * 0.6);
        this.signupContainer.setVisible(false);

        // Forms
        this.createLoginForm();
        this.createSignupForm();

        // Inputs
        this.usernameInput = this.formManager.createHTMLInput('text', LoginScene.USERNAME_PLACEHOLDER);
        this.passwordInput = this.formManager.createHTMLInput('password', LoginScene.PASSWORD_PLACEHOLDER);
        this.signupUsernameInput = this.formManager.createHTMLInput('text', LoginScene.USERNAME_PLACEHOLDER);
        this.signupEmailInput = this.formManager.createHTMLInput('email', LoginScene.EMAIL_PLACEHOLDER);
        this.signupPasswordInput = this.formManager.createHTMLInput('password', LoginScene.PASSWORD_PLACEHOLDER);

        // Status text
        this.errorText = this.add.text(
            W / 2, H * 0.85, '',
            StyleHelpers.createTextStyle({ fontSize: '16px', color: '#e53e3e', fontStyle: '500' })
        ).setOrigin(0.5);

        this.loadingText = this.add.text(
            W / 2, H * 0.9, '',
            StyleHelpers.createTextStyle({ fontSize: '16px', color: '#3182ce', fontStyle: '500' })
        ).setOrigin(0.5);

        // Events
        this.setupEventListeners();

        // Initial layout
        this.formManager.updateInputDimensions([
            this.usernameInput, this.passwordInput,
            this.signupUsernameInput, this.signupEmailInput, this.signupPasswordInput
        ]);
        this.updateInputPositions();
        this.clearError();
        this.hideLoading();

        if (this.authService.isAuthenticated()) {
            this.startGame();
        }
    }

    private setupEventListeners() {
        this.resizeHandler = () => {
            this.formManager.updateInputDimensions([
                this.usernameInput, this.passwordInput,
                this.signupUsernameInput, this.signupEmailInput, this.signupPasswordInput
            ]);
            this.updateInputPositions();
        };

        this.cameraHandler = () => this.updateInputPositions();

        window.addEventListener('resize', this.resizeHandler);
        this.scale.on('resize', this.cameraHandler);
        this.cameras.main.on('camerazoom', this.cameraHandler);
        this.cameras.main.on('camerarotate', this.cameraHandler);
        this.cameras.main.on('camerascroll', this.cameraHandler);
    }

    private createLoginForm() {
        const c = this.loginContainer;
        const { formWidth, formHeight, formRadius } = this.formManager.getDimensions();

        const formBg = this.add.graphics();
        formBg.fillStyle(0xffffff, 1);
        formBg.lineStyle(3, 0xe2e8f0, 1);
        formBg.fillRoundedRect(-formWidth / 2, -formHeight / 2, formWidth, formHeight, formRadius);
        formBg.strokeRoundedRect(-formWidth / 2, -formHeight / 2, formWidth, formHeight, formRadius);
        formBg.setDepth(-1);
        c.add(formBg);

        // Labels (centered; these are the anchors)
        this.loginUsernameLabel = this.add.text(0, -110, 'Username', StyleHelpers.createLabelTextStyle()).setOrigin(0.5);
        this.loginPasswordLabel = this.add.text(0, -30, 'Password', StyleHelpers.createLabelTextStyle()).setOrigin(0.5);
        c.add([this.loginUsernameLabel, this.loginPasswordLabel]);

        // Button
        this.createButton(c, 'Login', 0, 55, () => this.handleLogin());

        // Switch link
        this.createSwitchLink(c, "Don't have an account? Sign up", 0, 120, () => this.switchToSignup());
    }

    private createSignupForm() {
        const c = this.signupContainer;
        const { formWidth, formHeight, formRadius } = this.formManager.getDimensions();
        const signupHeight = formHeight + 50;

        const formBg = this.add.graphics();
        formBg.fillStyle(0xffffff, 1);
        formBg.lineStyle(3, 0xe2e8f0, 1);
        formBg.fillRoundedRect(-formWidth / 2, -signupHeight / 2, formWidth, signupHeight, formRadius);
        formBg.strokeRoundedRect(-formWidth / 2, -signupHeight / 2, formWidth, signupHeight, formRadius);
        formBg.setDepth(-1);
        c.add(formBg);

        c.add(this.add.text(0, -170, 'Sign Up', StyleHelpers.createTitleTextStyle('28px')).setOrigin(0.5));

        // Labels (anchors)
        this.signupEmailLabel = this.add.text(0, -100, 'Email', StyleHelpers.createLabelTextStyle()).setOrigin(0.5);
        this.signupUsernameLabel = this.add.text(0, -30, 'Username', StyleHelpers.createLabelTextStyle()).setOrigin(0.5);
        this.signupPasswordLabel = this.add.text(0, 30, 'Password', StyleHelpers.createLabelTextStyle()).setOrigin(0.5);
        c.add([this.signupEmailLabel, this.signupUsernameLabel, this.signupPasswordLabel]);

        // Button
        this.createButton(c, 'Create account', 0, 95, () => this.handleSignup());

        // Switch link
        this.createSwitchLink(c, 'Already have an account? Login', 0, 160, () => this.switchToLogin());
    }

    private createButton(container: Phaser.GameObjects.Container, text: string, x: number, y: number, onClick: () => void) {
        const { buttonWidth, buttonHeight, buttonRadius, fontSize } = this.formManager.getDimensions();

        const button = this.add.graphics();
        button.fillStyle(GAME_CONFIG.COLORS.FRESH_GREEN, 1);
        button.fillRoundedRect(-buttonWidth / 2, y, buttonWidth, buttonHeight, buttonRadius);
        button.lineStyle(2, 0xffffff, 0.8);
        button.strokeRoundedRect(-buttonWidth / 2, y, buttonWidth, buttonHeight, buttonRadius);

        const buttonText = this.add.text(x, y + buttonHeight / 2, text, StyleHelpers.createButtonTextStyle(fontSize.toString())).setOrigin(0.5);

        button.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth / 2, y, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        (button.input as any)!.cursor = 'pointer';

        button.on('pointerover', () => {
            button.clear();
            button.fillStyle(GAME_CONFIG.COLORS.DARK_GREEN, 1);
            button.fillRoundedRect(-buttonWidth / 2, y, buttonWidth, buttonHeight, buttonRadius);
            button.lineStyle(2, 0xffffff, 0.8);
            button.strokeRoundedRect(-buttonWidth / 2, y, buttonWidth, buttonHeight, buttonRadius);
            this.tweens.add({ targets: buttonText, scale: 1.05, duration: 200, ease: 'Power2' });
        });

        button.on('pointerout', () => {
            button.clear();
            button.fillStyle(GAME_CONFIG.COLORS.FRESH_GREEN, 1);
            button.fillRoundedRect(-buttonWidth / 2, y, buttonWidth, buttonHeight, buttonRadius);
            button.lineStyle(2, 0xffffff, 0.8);
            button.strokeRoundedRect(-buttonWidth / 2, y, buttonWidth, buttonHeight, buttonRadius);
            this.tweens.add({ targets: buttonText, scale: 1, duration: 200, ease: 'Power2' });
        });

        button.on('pointerdown', () => {
            this.tweens.add({ targets: buttonText, scale: 0.95, duration: 100, yoyo: true, ease: 'Power2' });
            onClick();
        });

        container.add([button, buttonText]);
    }

    private createSwitchLink(container: Phaser.GameObjects.Container, text: string, x: number, y: number, onClick: () => void) {
        const switchText = this.add.text(x, y, text, StyleHelpers.createTextStyle({ fontSize: '14px', color: '#3182ce', fontStyle: '500' })).setOrigin(0.5);
        switchText.setInteractive();
        (switchText.input as any)!.cursor = 'pointer';

        switchText.on('pointerover', () => {
            switchText.setColor('#2c5282');
            this.tweens.add({ targets: switchText, scale: 1.05, duration: 200, ease: 'Power2' });
        });
        switchText.on('pointerout', () => {
            switchText.setColor('#3182ce');
            this.tweens.add({ targets: switchText, scale: 1, duration: 200, ease: 'Power2' });
        });
        switchText.on('pointerdown', () => {
            this.tweens.add({ targets: switchText, scale: 0.95, duration: 100, yoyo: true, ease: 'Power2' });
            onClick();
        });

        container.add(switchText);
    }

    private updateInputPositions() {
        if (this.isSignUpMode) {
            this.formManager.updateSignupInputPositions(
                { username: this.signupUsernameInput, email: this.signupEmailInput, password: this.signupPasswordInput },
                { username: this.usernameInput, password: this.passwordInput },
                this.signupEmailLabel,
                this.signupUsernameLabel,
                this.signupPasswordLabel
            );
        } else {
            this.formManager.updateLoginInputPositions(
                this.usernameInput,
                this.passwordInput,
                { username: this.signupUsernameInput, email: this.signupEmailInput, password: this.signupPasswordInput },
                this.loginUsernameLabel,
                this.loginPasswordLabel
            );
        }
    }

    private async handleLogin() {
        const username = this.usernameInput?.value.trim() || '';
        const password = this.passwordInput?.value || '';
        if (!username || !password) return this.showError('Please fill in all fields');

        this.showLoading('Logging in...');
        try {
            const user = await this.authService.signInWithUsername(username, password);
            if (user) this.startGame();
        } catch (error: any) {
            this.showError(this.getErrorMessage(error));
        } finally {
            this.hideLoading();
        }
    }

    private async handleSignup() {
        const email = this.signupEmailInput?.value.trim() || '';
        const username = this.signupUsernameInput?.value.trim() || '';
        const password = this.signupPasswordInput?.value || '';

        if (!email || !username || !password) return this.showError('Please fill in all fields');
        if (password.length < 6) return this.showError('Password must be at least 6 characters');

        this.showLoading('Creating account...');
        try {
            const user = await this.authService.signUpWithUsername(username, password, email);
            if (user) this.startGame();
        } catch (error: any) {
            this.showError(this.getErrorMessage(error));
        } finally {
            this.hideLoading();
        }
    }

    private startGame() {
        this.formManager.removeInputs([
            this.usernameInput, this.passwordInput,
            this.signupUsernameInput, this.signupEmailInput, this.signupPasswordInput
        ]);
        this.scene.start('Preloader');
    }

    private clearInputValues() {
        [this.usernameInput, this.passwordInput, this.signupUsernameInput, this.signupEmailInput, this.signupPasswordInput]
            .forEach(i => i && (i.value = ''));
    }

    private switchToSignup() {
        this.isSignUpMode = true;
        this.loginContainer.setVisible(false);
        this.signupContainer.setVisible(true);
        this.clearInputValues();
        this.updateInputPositions();
        this.clearError();
    }

    private switchToLogin() {
        this.isSignUpMode = false;
        this.loginContainer.setVisible(true);
        this.signupContainer.setVisible(false);
        this.clearInputValues();
        this.updateInputPositions();
        this.clearError();
    }

    private showError(message: string) {
        this.errorText?.setText(message);
    }
    private clearError() {
        this.errorText?.setText('');
    }
    private showLoading(message: string) {
        this.loadingText?.setText(message);
    }
    private hideLoading() {
        this.loadingText?.setText('');
    }

    private getErrorMessage(error: any): string {
        if (error?.code) {
            switch (error.code) {
                case 'auth/user-not-found': return 'No account found with this email';
                case 'auth/wrong-password': return 'Incorrect password';
                case 'auth/email-already-in-use': return 'Email already registered';
                case 'auth/weak-password': return 'Password is too weak';
                case 'auth/invalid-email': return 'Invalid email address';
                case 'auth/too-many-requests': return 'Too many attempts. Try again later';
                default: return 'An error occurred. Please try again';
            }
        }
        return 'An error occurred. Please try again';
    }

    shutdown() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        if (this.cameraHandler) {
            this.scale.off('resize', this.cameraHandler);
            this.cameras.main.off('camerazoom', this.cameraHandler);
            this.cameras.main.off('camerarotate', this.cameraHandler);
            this.cameras.main.off('camerascroll', this.cameraHandler);
            this.cameraHandler = null;
        }
        this.formManager.removeInputs([
            this.usernameInput, this.passwordInput,
            this.signupUsernameInput, this.signupEmailInput, this.signupPasswordInput
        ]);
        this.errorText?.setText('');
        this.loadingText?.setText('');
        this.isSignUpMode = false;
    }
}
