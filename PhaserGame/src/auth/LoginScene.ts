import Phaser from 'phaser';
import { AuthService, AuthUser } from './AuthService';

export class LoginScene extends Phaser.Scene {
    private authService: AuthService;
    private loginContainer: Phaser.GameObjects.Container;
    private signupContainer: Phaser.GameObjects.Container;
    private emailInput: HTMLInputElement | null = null;
    private passwordInput: HTMLInputElement | null = null;
    private displayNameInput: HTMLInputElement | null = null;
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

    create() {
        const { width: W, height: H } = this.sys.game.scale;
        this.authService = AuthService.getInstance();

        // Background - match main game background
        this.add.rectangle(W / 2, H / 2, W, H, 0xf8f9fa);

        // Title - match main game styling
        this.add.text(W / 2, H * 0.15, 'Mathatro', {
            fontSize: '48px',
            color: '#2c3e50',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.2, 'Card Memory Game', {
            fontSize: '24px',
            color: '#7f8c8d'
        }).setOrigin(0.5);

        // Create containers for login and signup forms
        // Position forms lower to avoid overlap with title
        this.loginContainer = this.add.container(W / 2, H * 0.6);
        this.signupContainer = this.add.container(W / 2, H * 0.6);
        this.signupContainer.setVisible(false);

        this.createLoginForm();
        this.createSignupForm();
        
        // Create HTML inputs once and manage them
        this.emailInput = this.createHTMLInput('text', LoginScene.USERNAME_PLACEHOLDER, -50);
        this.passwordInput = this.createHTMLInput('password', LoginScene.PASSWORD_PLACEHOLDER, 10);
        this.displayNameInput = this.createHTMLInput('text', LoginScene.USERNAME_PLACEHOLDER, -80);
        
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

        // Login form background - match main game sidebar style
        const formBg = this.add.rectangle(0, 0, 600, 400, 0xe9ecef, 0.95);
        formBg.setStrokeStyle(2, 0x6c757d);
        container.add(formBg);

        // Login title - match main game text styling
        const loginTitle = this.add.text(0, -150, 'Login', {
            fontSize: '28px',
            color: '#2c3e50',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(loginTitle);

        // Username input
        this.createInputField(container, -50, 'Username', 'text');

        // Password input
        this.createInputField(container, 10, 'Password', 'password');

        // Login button - match main game green button style
        const loginBtn = this.add.rectangle(0, 80, 200, 40, 0x28a745);
        const loginBtnText = this.add.text(0, 80, 'Login', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        loginBtn.setInteractive();
        loginBtn.on('pointerdown', () => this.handleLogin());
        container.add([loginBtn, loginBtnText]);

        // Switch to signup - match main game link styling
        const switchText = this.add.text(0, 120, 'Don\'t have an account? Sign up', {
            fontSize: '14px',
            color: '#007bff'
        }).setOrigin(0.5);
        switchText.setInteractive();
        switchText.on('pointerdown', () => this.switchToSignup());
        container.add(switchText);
    }

    private createSignupForm() {
        const container = this.signupContainer;

        // Signup form background - match main game sidebar style
        const formBg = this.add.rectangle(0, 0, 600, 500, 0xe9ecef, 0.95);
        formBg.setStrokeStyle(2, 0x6c757d);
        container.add(formBg);

        // Signup title - match main game text styling
        const signupTitle = this.add.text(0, -170, 'Sign Up', {
            fontSize: '28px',
            color: '#2c3e50',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(signupTitle);

        // Username input
        this.createInputField(container, -80, 'Username', 'text');

        // Email input
        this.createInputField(container, -20, 'Email', 'email');

        // Password input
        this.createInputField(container, 40, 'Password', 'password');

        // Signup button - match main game green button style
        const signupBtn = this.add.rectangle(0, 110, 200, 40, 0x28a745);
        const signupBtnText = this.add.text(0, 110, 'Sign Up', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        signupBtn.setInteractive();
        signupBtn.on('pointerdown', () => this.handleSignup());
        container.add([signupBtn, signupBtnText]);

        // Switch to login - match main game link styling
        const switchText = this.add.text(0, 150, 'Already have an account? Login', {
            fontSize: '14px',
            color: '#007bff'
        }).setOrigin(0.5);
        switchText.setInteractive();
        switchText.on('pointerdown', () => this.switchToLogin());
        container.add(switchText);
    }

    private createInputField(container: Phaser.GameObjects.Container, y: number, label: string, type: string) {
        const labelText = this.add.text(-280, y, label, {
            fontSize: '16px',
            color: '#2c3e50'
        }).setOrigin(0, 0.5);
        container.add(labelText);

        const inputBg = this.add.rectangle(0, y, 350, 35, 0xffffff);
        inputBg.setStrokeStyle(2, 0x6c757d);
        container.add(inputBg);
    }

    private createHTMLInput(type: string, placeholder: string, y: number): HTMLInputElement {
        const input = document.createElement('input');
        input.type = type;
        input.placeholder = placeholder;
        input.style.position = 'absolute';
        input.style.left = '50%';
        input.style.top = '50%';
        input.style.transform = 'translate(-50%, -50%)';
        input.style.width = '340px';
        input.style.height = '30px';
        input.style.padding = '5px';
        input.style.border = 'none';
        input.style.borderRadius = '3px';
        input.style.backgroundColor = '#ffffff';
        input.style.color = '#2c3e50';
        input.style.fontSize = '14px';
        input.style.outline = 'none';
        input.style.zIndex = '1000';
        
        // Position the input based on y offset
        const gameHeight = this.sys.game.scale.height;
        const inputY = (gameHeight * 0.6) + y;
        input.style.top = `${inputY}px`;
        
        document.body.appendChild(input);
        return input;
    }

    private switchToSignup() {
        this.isSignUpMode = true;
        this.loginContainer.setVisible(false);
        this.signupContainer.setVisible(true);
        
        // Update input positions for signup form
        this.updateInputPositions();
        this.clearError();
    }

    private switchToLogin() {
        this.isSignUpMode = false;
        this.loginContainer.setVisible(true);
        this.signupContainer.setVisible(false);
        
        // Update input positions for login form
        this.updateInputPositions();
        this.clearError();
    }

    private updateInputPositions() {
        const gameHeight = this.sys.game.scale.height;
        const baseY = gameHeight * 0.6;

        if (this.isSignUpMode) {
            // Signup form positions
            if (this.displayNameInput) {
                this.displayNameInput.style.top = `${baseY - 80}px`;
                this.displayNameInput.style.display = 'block';
            }
            if (this.emailInput) {
                this.emailInput.style.top = `${baseY - 20}px`;
                this.emailInput.placeholder = LoginScene.EMAIL_PLACEHOLDER;
            }
            if (this.passwordInput) {
                this.passwordInput.style.top = `${baseY + 40}px`;
                this.passwordInput.placeholder = LoginScene.PASSWORD_PLACEHOLDER;
            }
        } else {
            // Login form positions
            if (this.displayNameInput) {
                this.displayNameInput.style.display = 'none';
            }
            if (this.emailInput) {
                this.emailInput.style.top = `${baseY - 50}px`;
                this.emailInput.placeholder = LoginScene.USERNAME_PLACEHOLDER;
            }
            if (this.passwordInput) {
                this.passwordInput.style.top = `${baseY + 10}px`;
                this.passwordInput.placeholder = LoginScene.PASSWORD_PLACEHOLDER;
            }
        }
    }

    private async handleLogin() {
        const username = this.emailInput?.value.trim() || '';
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
        const email = this.emailInput?.value.trim() || '';
        const password = this.passwordInput?.value || '';
        const username = this.displayNameInput?.value.trim() || '';

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
        this.emailInput?.parentNode?.removeChild(this.emailInput);
        this.passwordInput?.parentNode?.removeChild(this.passwordInput);
        this.displayNameInput?.parentNode?.removeChild(this.displayNameInput);
        
        this.emailInput = null;
        this.passwordInput = null;
        this.displayNameInput = null;
    }

    private showError(message: string) {
        this.errorText.setText(message);
    }

    private clearError() {
        this.errorText.setText('');
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
        this.removeHTMLInputs();
    }
}
