import Phaser from 'phaser';
import { AuthService, AuthUser } from './AuthService';
import { GAME_CONFIG } from '../config/GameConstants';
import { createTitleText } from '../utils/UIHelpers';

export class LoginScene extends Phaser.Scene {
    private authService: AuthService;
    private loginContainer: Phaser.GameObjects.Container;
    private signupContainer: Phaser.GameObjects.Container;
    private usernameInput: HTMLInputElement | null = null;     // Login: username field
    private passwordInput: HTMLInputElement | null = null;        // Login: password field
    private signupUsernameInput: HTMLInputElement | null = null;  // Signup: username field
    private signupEmailInput: HTMLInputElement | null = null;     // Signup: email field
    private signupPasswordInput: HTMLInputElement | null = null;  // Signup: password field
    private errorText: Phaser.GameObjects.Text;
    private loadingText: Phaser.GameObjects.Text;
    private isSignUpMode: boolean = false;

    // Constants to avoid SonarQube false positives
    private static readonly PASSWORD_PLACEHOLDER = 'Enter your password';
    private static readonly USERNAME_PLACEHOLDER = 'Enter your username';
    private static readonly EMAIL_PLACEHOLDER = 'Enter your email';

    constructor() {
        super({ key: 'LoginScene' });
    }

    init() {
        // Initialize scene state - this runs before create()
        this.isSignUpMode = false;
    }

    create() {
        const { width: W, height: H } = this.sys.game.scale;
        this.authService = AuthService.getInstance();

        // Clean up any existing HTML inputs from previous sessions
        this.removeHTMLInputs();

        // Background with vibrant game theme gradient
        const bg = this.add.graphics();
        // Soft blue to teal gradient
        bg.fillGradientStyle(0x4facfe, 0x4facfe, 0x00f2fe, 0x00f2fe, 1);
        bg.fillRect(0, 0, W, H);

        // Title with consistent game styling
        createTitleText(this, W / 2, H * 0.15, 'Mathatro', { fontSize: 52 });

        const subtitle = this.add.text(W / 2, H * 0.23, 'It\'s a piece of π!', {
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: '500',
            fontFamily: GAME_CONFIG.FONT.FAMILY
        }).setOrigin(0.5);

        // Create containers for login and signup forms
        // Position forms lower to avoid overlap with title
        this.loginContainer = this.add.container(W / 2, H * 0.6);
        this.signupContainer = this.add.container(W / 2, H * 0.6);
        this.signupContainer.setVisible(false);

        this.createLoginForm();
        this.createSignupForm();

        // Create HTML inputs for both forms
        // Login form inputs (username + password)
        this.usernameInput = this.createHTMLInput('text', LoginScene.USERNAME_PLACEHOLDER);
        this.passwordInput = this.createHTMLInput('password', LoginScene.PASSWORD_PLACEHOLDER);

        // Signup form inputs (username + email + password)
        this.signupUsernameInput = this.createHTMLInput('text', LoginScene.USERNAME_PLACEHOLDER);
        this.signupEmailInput = this.createHTMLInput('email', LoginScene.EMAIL_PLACEHOLDER);
        this.signupPasswordInput = this.createHTMLInput('password', LoginScene.PASSWORD_PLACEHOLDER);

        // Set initial positions for login mode
        this.updateInputPositions();

        // Error and loading text - match main game styling
        this.errorText = this.add.text(W / 2, H * 0.85, '', {
            fontSize: '16px',
            color: '#e53e3e',
            fontFamily: GAME_CONFIG.FONT.FAMILY,
            fontStyle: '500',
            align: 'center'
        }).setOrigin(0.5);

        this.loadingText = this.add.text(W / 2, H * 0.9, '', {
            fontSize: '16px',
            color: '#3182ce',
            fontFamily: GAME_CONFIG.FONT.FAMILY,
            fontStyle: '500',
            align: 'center'
        }).setOrigin(0.5);

        // Reset form state
        this.isSignUpMode = false;
        this.clearError();
        this.hideLoading();
        this.clearInputValues();

        // Check if user is already authenticated
        if (this.authService.isAuthenticated()) {
            this.startGame();
        }

        // Listen for authentication state changes
        this.authService.onAuthStateChange((user: AuthUser | null) => {
            if (user) {
                this.startGame();
            }
        });
    }

    private createLoginForm() {
        const container = this.loginContainer;

        // Create modern form container - solid white, compact size
        const formBg = this.add.graphics();
        formBg.fillStyle(0xffffff, 1);
        formBg.lineStyle(3, 0xe2e8f0, 1);
        formBg.fillRoundedRect(-225, -150, 450, 330, 16);
        formBg.strokeRoundedRect(-225, -150, 450, 330, 16);
        formBg.setDepth(-1);
        container.add(formBg);


        // Input field labels with modern styling
        const usernameLabel = this.add.text(0, -110, 'Username', {
            fontSize: '16px',
            color: '#2d3748',
            fontStyle: '600',
            fontFamily: GAME_CONFIG.FONT.FAMILY
        }).setOrigin(0.5);
        container.add(usernameLabel);

        const passwordLabel = this.add.text(0, -30, 'Password', {
            fontSize: '16px',
            color: '#2d3748',
            fontStyle: '600',
            fontFamily: GAME_CONFIG.FONT.FAMILY
        }).setOrigin(0.5);
        container.add(passwordLabel);

        // Login button with modern game theme
        const loginBtn = this.add.graphics();
        loginBtn.fillStyle(GAME_CONFIG.COLORS.FRESH_GREEN, 1);
        loginBtn.fillRoundedRect(-120, 55, 240, 50, 12);
        loginBtn.lineStyle(2, 0xffffff, 0.8);
        loginBtn.strokeRoundedRect(-120, 55, 240, 50, 12);

        const loginBtnText = this.add.text(0, 80, 'Login', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: '600',
            fontFamily: GAME_CONFIG.FONT.FAMILY
        }).setOrigin(0.5);

        loginBtn.setInteractive(new Phaser.Geom.Rectangle(-120, 55, 240, 50), Phaser.Geom.Rectangle.Contains);
        loginBtn.input!.cursor = 'pointer';

        loginBtn.on('pointerover', () => {
            loginBtn.clear();
            loginBtn.fillStyle(GAME_CONFIG.COLORS.DARK_GREEN, 1);
            loginBtn.fillRoundedRect(-120, 55, 240, 50, 12);
            loginBtn.lineStyle(2, 0xffffff, 0.8);
            loginBtn.strokeRoundedRect(-120, 55, 240, 50, 12);
            this.tweens.add({
                targets: loginBtnText,
                scale: 1.05,
                duration: 200,
                ease: 'Power2'
            });
        });
        loginBtn.on('pointerout', () => {
            loginBtn.clear();
            loginBtn.fillStyle(GAME_CONFIG.COLORS.FRESH_GREEN, 1);
            loginBtn.fillRoundedRect(-120, 55, 240, 50, 12);
            loginBtn.lineStyle(2, 0xffffff, 0.8);
            loginBtn.strokeRoundedRect(-120, 55, 240, 50, 12);
            this.tweens.add({
                targets: loginBtnText,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        loginBtn.on('pointerdown', () => {
            this.tweens.add({
                targets: loginBtnText,
                scale: 0.95,
                duration: 100,
                yoyo: true,
                ease: 'Power2'
            });
            this.handleLogin();
        });
        container.add([loginBtn, loginBtnText]);

        // Switch to signup link with modern styling
        const switchText = this.add.text(0, 120, 'Don\'t have an account? Sign up', {
            fontSize: '14px',
            color: '#3182ce',
            fontFamily: GAME_CONFIG.FONT.FAMILY,
            fontStyle: '500'
        }).setOrigin(0.5);
        switchText.setInteractive();
        switchText.input!.cursor = 'pointer';

        switchText.on('pointerover', () => {
            switchText.setColor('#2c5282');
            this.tweens.add({
                targets: switchText,
                scale: 1.05,
                duration: 200,
                ease: 'Power2'
            });
        });
        switchText.on('pointerout', () => {
            switchText.setColor('#3182ce');
            this.tweens.add({
                targets: switchText,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        switchText.on('pointerdown', () => {
            this.tweens.add({
                targets: switchText,
                scale: 0.95,
                duration: 100,
                yoyo: true,
                ease: 'Power2'
            });
            this.switchToSignup();
        });
        container.add(switchText);
    }

    private createSignupForm() {
        const container = this.signupContainer;

        // Modern signup form container - compact size
        const formBg = this.add.graphics();
        formBg.fillStyle(0xffffff, 1);
        formBg.lineStyle(3, 0xe2e8f0, 1);
        formBg.fillRoundedRect(-225, -200, 450, 420, 16);
        formBg.strokeRoundedRect(-225, -200, 450, 420, 16);
        formBg.setDepth(-1);
        container.add(formBg);


        // Signup title with modern styling
        const signupTitle = this.add.text(0, -170, 'Sign Up', {
            fontSize: '28px',
            color: '#2d3748',
            fontStyle: '700',
            fontFamily: GAME_CONFIG.FONT.FAMILY
        }).setOrigin(0.5);
        container.add(signupTitle);

        // Input field labels with modern styling - Email first, then Username
        const emailLabel = this.add.text(0, -90, 'Email', {
            fontSize: '16px',
            color: '#2d3748',
            fontStyle: '600',
            fontFamily: GAME_CONFIG.FONT.FAMILY
        }).setOrigin(0.5);
        container.add(emailLabel);

        const usernameLabel = this.add.text(0, -30, 'Username', {
            fontSize: '16px',
            color: '#2d3748',
            fontStyle: '600',
            fontFamily: GAME_CONFIG.FONT.FAMILY
        }).setOrigin(0.5);
        container.add(usernameLabel);

        const passwordLabel = this.add.text(0, 30, 'Password', {
            fontSize: '16px',
            color: '#2d3748',
            fontStyle: '600',
            fontFamily: GAME_CONFIG.FONT.FAMILY
        }).setOrigin(0.5);
        container.add(passwordLabel);

        // Signup button with modern game theme
        const signupBtn = this.add.graphics();
        signupBtn.fillStyle(GAME_CONFIG.COLORS.FRESH_GREEN, 1);
        signupBtn.fillRoundedRect(-120, 95, 240, 50, 12);
        signupBtn.lineStyle(2, 0xffffff, 0.8);
        signupBtn.strokeRoundedRect(-120, 95, 240, 50, 12);

        const signupBtnText = this.add.text(0, 120, 'Create account', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: '600',
            fontFamily: GAME_CONFIG.FONT.FAMILY
        }).setOrigin(0.5);

        signupBtn.setInteractive(new Phaser.Geom.Rectangle(-120, 95, 240, 50), Phaser.Geom.Rectangle.Contains);
        signupBtn.input!.cursor = 'pointer';

        signupBtn.on('pointerover', () => {
            signupBtn.clear();
            signupBtn.fillStyle(GAME_CONFIG.COLORS.DARK_GREEN, 1);
            signupBtn.fillRoundedRect(-120, 95, 240, 50, 12);
            signupBtn.lineStyle(2, 0xffffff, 0.8);
            signupBtn.strokeRoundedRect(-120, 95, 240, 50, 12);
            this.tweens.add({
                targets: signupBtnText,
                scale: 1.05,
                duration: 200,
                ease: 'Power2'
            });
        });
        signupBtn.on('pointerout', () => {
            signupBtn.clear();
            signupBtn.fillStyle(GAME_CONFIG.COLORS.FRESH_GREEN, 1);
            signupBtn.fillRoundedRect(-120, 95, 240, 50, 12);
            signupBtn.lineStyle(2, 0xffffff, 0.8);
            signupBtn.strokeRoundedRect(-120, 95, 240, 50, 12);
            this.tweens.add({
                targets: signupBtnText,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        signupBtn.on('pointerdown', () => {
            this.tweens.add({
                targets: signupBtnText,
                scale: 0.95,
                duration: 100,
                yoyo: true,
                ease: 'Power2'
            });
            this.handleSignup();
        });
        container.add([signupBtn, signupBtnText]);

        // Switch to login with modern styling
        const switchText = this.add.text(0, 170, 'Already have an account? Log in', {
            fontSize: '14px',
            color: '#3182ce',
            fontFamily: GAME_CONFIG.FONT.FAMILY,
            fontStyle: '500'
        }).setOrigin(0.5);
        switchText.setInteractive();
        switchText.input!.cursor = 'pointer';

        switchText.on('pointerover', () => {
            switchText.setColor('#2c5282');
            this.tweens.add({
                targets: switchText,
                scale: 1.05,
                duration: 200,
                ease: 'Power2'
            });
        });
        switchText.on('pointerout', () => {
            switchText.setColor('#3182ce');
            this.tweens.add({
                targets: switchText,
                scale: 1,
                duration: 200,
                ease: 'Power2'
            });
        });
        switchText.on('pointerdown', () => {
            this.tweens.add({
                targets: switchText,
                scale: 0.95,
                duration: 100,
                yoyo: true,
                ease: 'Power2'
            });
            this.switchToLogin();
        });
        container.add(switchText);
    }


    private createHTMLInput(type: string, placeholder: string): HTMLInputElement {
        const input = document.createElement('input');
        input.type = type;
        input.placeholder = placeholder;

        // Apply modern game theme styling
        input.style.position = 'absolute';
        input.style.left = '50%';
        input.style.transform = 'translateX(-50%)';
        input.style.zIndex = '1000';
        input.style.width = '320px';
        input.style.height = '45px';
        input.style.border = '2px solid #e2e8f0';
        input.style.borderRadius = '12px';
        input.style.padding = '12px 16px';
        input.style.fontSize = '16px';
        input.style.fontFamily = '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        input.style.fontWeight = '400';
        input.style.backgroundColor = '#ffffff';
        input.style.color = '#2d3748';
        input.style.outline = 'none';
        input.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
        input.style.transition = 'all 0.3s ease-in-out';
        input.style.boxSizing = 'border-box';

        // Add modern focus styles
        input.addEventListener('focus', () => {
            input.style.borderColor = '#4c51bf';
            input.style.boxShadow = '0 0 0 3px rgba(76, 81, 191, 0.1), 0 8px 16px rgba(0, 0, 0, 0.12)';
        });

        input.addEventListener('blur', () => {
            input.style.borderColor = '#e2e8f0';
            input.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
        });

        document.body.appendChild(input);
        return input;
    }

    private switchToSignup() {
        this.isSignUpMode = true;
        this.loginContainer.setVisible(false);
        this.signupContainer.setVisible(true);

        // Clear input values when switching modes
        this.clearInputValues();

        // Update input positions for signup form
        this.updateInputPositions();
        this.clearError();
    }

    private switchToLogin() {
        this.isSignUpMode = false;
        this.loginContainer.setVisible(true);
        this.signupContainer.setVisible(false);

        // Clear input values when switching modes
        this.clearInputValues();

        // Update input positions for login form
        this.updateInputPositions();
        this.clearError();
    }

    private updateInputPositions() {
        const gameHeight = this.sys.game.scale.height;
        const baseY = gameHeight * 0.6;

        if (this.isSignUpMode) {
            // Show signup form inputs (3 fields) - Email first, then Username
            this.signupEmailInput!.style.display = 'block';
            this.signupEmailInput!.style.top = `${baseY + 100}px`;
            this.signupUsernameInput!.style.display = 'block';
            this.signupUsernameInput!.style.top = `${baseY + 190}px`;
            this.signupPasswordInput!.style.display = 'block';
            this.signupPasswordInput!.style.top = `${baseY + 280}px`;

            // Hide login form inputs
            this.usernameInput!.style.display = 'none';
            this.passwordInput!.style.display = 'none';
        } else {
            // Show login form inputs (2 fields)
            this.usernameInput!.style.display = 'block';
            this.usernameInput!.style.top = `${baseY + 80}px`;
            this.passwordInput!.style.display = 'block';
            this.passwordInput!.style.top = `${baseY + 200}px`;

            // Hide signup form inputs
            this.signupUsernameInput!.style.display = 'none';
            this.signupEmailInput!.style.display = 'none';
            this.signupPasswordInput!.style.display = 'none';
        }
    }

    private async handleLogin() {
        const username = this.usernameInput?.value.trim() || '';
        const password = this.passwordInput?.value || '';

        if (!username || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        this.showLoading('Logging in...');
        this.clearError();

        try {
            await this.authService.signInWithUsername(username, password);
            // Authentication state change will trigger startGame()
        } catch (error: any) {
            this.hideLoading();
            this.showError(this.getErrorMessage(error.message || error.code));
        }
    }

    private async handleSignup() {
        const username = this.signupUsernameInput?.value.trim() || '';
        const email = this.signupEmailInput?.value.trim() || '';
        const password = this.signupPasswordInput?.value || '';

        if (!email || !password || !username) {
            this.showError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        this.showLoading('Creating account...');
        this.clearError();

        try {
            await this.authService.signUpWithUsername(username, password, email);
            // Authentication state change will trigger startGame()
        } catch (error: any) {
            this.hideLoading();
            this.showError(this.getErrorMessage(error.message || error.code));
        }
    }

    private startGame() {
        // Remove HTML inputs
        this.removeHTMLInputs();

        // Start the game scenes
        this.scene.start('Preloader');
    }

    private removeHTMLInputs() {
        // Remove all HTML inputs
        [this.usernameInput, this.passwordInput, this.signupUsernameInput, this.signupEmailInput, this.signupPasswordInput]
            .forEach(input => input?.parentNode?.removeChild(input));

        // Clear all references
        this.usernameInput = this.passwordInput = this.signupUsernameInput = this.signupEmailInput = this.signupPasswordInput = null;
    }

    private showError(message: string) {
        this.errorText.setText(message);
    }

    private clearError() {
        this.errorText.setText('');
    }

    private clearInputValues() {
        // Clear all input values
        [this.usernameInput, this.passwordInput, this.signupUsernameInput, this.signupEmailInput, this.signupPasswordInput]
            .forEach(input => input && (input.value = ''));
    }

    private showLoading(message: string) {
        this.loadingText.setText(message);
    }

    private hideLoading() {
        this.loadingText.setText('');
    }

    private getErrorMessage(errorCode: string): string {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No account found with this username';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists';
            case 'auth/weak-password':
                return 'Password is too weak';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later';
            case 'Username not found':
                return 'Username not found. Please check your username or sign up for a new account.';
            case 'Username is already taken':
                return 'This username is already taken. Please choose a different username.';
            default:
                return 'An error occurred. Please try again';
        }
    }

    shutdown() {
        // Clean up HTML inputs
        this.removeHTMLInputs();

        // Clear any error or loading messages
        this.errorText?.setText('');
        this.loadingText?.setText('');

        // Reset form state
        this.isSignUpMode = false;
    }
}
