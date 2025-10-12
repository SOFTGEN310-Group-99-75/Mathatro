import Phaser from 'phaser';
import { AuthService, AuthUser } from './AuthService';

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

        // Background with modern gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xf8f9fa, 0xf8f9fa, 0xe9ecef, 0xe9ecef, 1);
        bg.fillRect(0, 0, W, H);

        // Title with CSS styling
        const title = this.add.text(W / 2, H * 0.15, 'Mathatro', {
            fontSize: '52px',
            color: '#2c3e50',
            fontStyle: 'bold',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);
        title.setStroke('#ffffff', 2);

        const subtitle = this.add.text(W / 2, H * 0.2, 'Card Memory Game', {
            fontSize: '22px',
            color: '#6c757d',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
            color: '#dc3545',
            align: 'center'
        }).setOrigin(0.5);

        this.loadingText = this.add.text(W / 2, H * 0.9, '', {
            fontSize: '16px',
            color: '#007bff',
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

        // Create form container with shadow
        const formBg = this.add.rectangle(0, 0, 650, 420, 0xffffff, 0.98);
        formBg.setStrokeStyle(1, 0xe9ecef);
        formBg.setDepth(-1);
        container.add(formBg);

        const shadow = this.add.rectangle(2, 2, 650, 420, 0x000000, 0.1);
        shadow.setDepth(-2);
        container.add(shadow);

        // Input field labels
        const usernameLabel = this.add.text(0, -110, 'Username', {
            fontSize: '16px',
            color: '#2c3e50',
            fontStyle: 'bold',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);
        container.add(usernameLabel);

        const passwordLabel = this.add.text(0, -30, 'Password', {
            fontSize: '16px',
            color: '#2c3e50',
            fontStyle: 'bold',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);
        container.add(passwordLabel);

        // Login button
        const loginBtn = this.add.rectangle(0, 80, 240, 50, 0x007bff);
        loginBtn.setStrokeStyle(1, 0x0056b3);
        const loginBtnText = this.add.text(0, 80, 'Login', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);

        loginBtn.setInteractive();
        loginBtn.on('pointerdown', () => this.handleLogin());
        container.add([loginBtn, loginBtnText]);

        // Switch to signup link
        const switchText = this.add.text(0, 120, 'Don\'t have an account? Sign up', {
            fontSize: '14px',
            color: '#007bff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);
        switchText.setInteractive();
        switchText.on('pointerdown', () => this.switchToSignup());
        container.add(switchText);
    }

    private createSignupForm() {
        const container = this.signupContainer;

        // Signup form background styled to match login
        const formBg = this.add.rectangle(0, 0, 650, 520, 0xffffff, 0.98);
        formBg.setStrokeStyle(1, 0xe9ecef);
        formBg.setDepth(-1);
        container.add(formBg);
        const shadow = this.add.rectangle(2, 2, 650, 520, 0x000000, 0.1);
        shadow.setDepth(-2);
        container.add(shadow);

        // Signup title with CSS styling
        const signupTitle = this.add.text(0, -170, 'Sign Up', {
            fontSize: '28px',
            color: '#2c3e50',
            fontStyle: 'bold',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);
        container.add(signupTitle);

        // Input field labels - Email first, then Username
        const emailLabel = this.add.text(0, -90, 'Email', {
            fontSize: '16px',
            color: '#2c3e50',
            fontStyle: 'bold',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);
        container.add(emailLabel);

        const usernameLabel = this.add.text(0, -30, 'Username', {
            fontSize: '16px',
            color: '#2c3e50',
            fontStyle: 'bold',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);
        container.add(usernameLabel);

        const passwordLabel = this.add.text(0, 30, 'Password', {
            fontSize: '16px',
            color: '#2c3e50',
            fontStyle: 'bold',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);
        container.add(passwordLabel);

        // Signup button - match main game green button style
        const signupBtn = this.add.rectangle(0, 120, 240, 50, 0x007bff);
        signupBtn.setStrokeStyle(1, 0x0056b3);
        const signupBtnText = this.add.text(0, 120, 'Create account', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);
        signupBtn.setInteractive();
        signupBtn.on('pointerover', () => {
            signupBtn.fillColor = 0x0056b3;
            signupBtn.setStrokeStyle(1, 0x004085);
        });
        signupBtn.on('pointerout', () => {
            signupBtn.fillColor = 0x007bff;
            signupBtn.setStrokeStyle(1, 0x0056b3);
        });
        signupBtn.on('pointerdown', () => this.handleSignup());
        container.add([signupBtn, signupBtnText]);

        // Switch to login - match main game link styling
        const switchText = this.add.text(0, 170, 'Already have an account? Log in', {
            fontSize: '14px',
            color: '#007bff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);
        switchText.setInteractive();
        switchText.on('pointerdown', () => this.switchToLogin());
        container.add(switchText);
    }


    private createHTMLInput(type: string, placeholder: string): HTMLInputElement {
        const input = document.createElement('input');
        input.type = type;
        input.placeholder = placeholder;

        // Apply consistent styling
        input.style.position = 'absolute';
        input.style.left = '50%';
        input.style.transform = 'translateX(-50%)';
        input.style.zIndex = '1000';
        input.style.width = '320px';
        input.style.height = '45px';
        input.style.border = '2px solid #e9ecef';
        input.style.borderRadius = '8px';
        input.style.padding = '12px 16px';
        input.style.fontSize = '16px';
        input.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        input.style.backgroundColor = '#ffffff';
        input.style.color = '#2c3e50';
        input.style.outline = 'none';
        input.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        input.style.transition = 'all 0.2s ease-in-out';
        input.style.boxSizing = 'border-box';

        // Add focus styles
        input.addEventListener('focus', () => {
            input.style.borderColor = '#007bff';
            input.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1), 0 4px 8px rgba(0, 0, 0, 0.15)';
        });

        input.addEventListener('blur', () => {
            input.style.borderColor = '#e9ecef';
            input.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
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
