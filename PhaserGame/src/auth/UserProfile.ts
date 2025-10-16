import Phaser from 'phaser';
import { AuthService, AuthUser } from './AuthService';

export class UserProfile {
    private readonly scene: Phaser.Scene;
    private readonly authService: AuthService;
    private readonly profileContainer: Phaser.GameObjects.Container;
    private userInfo!: Phaser.GameObjects.Text;
    private logoutButton!: Phaser.GameObjects.Rectangle;
    private logoutText!: Phaser.GameObjects.Text;
    private currentUser: AuthUser | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.authService = AuthService.getInstance();
        this.profileContainer = scene.add.container(0, 0);
        this.profileContainer.setDepth(1000); // Ensure it's on top
    }

    public create(x: number, y: number) {
        // Profile background with modern rounded corners effect
        const profileBg = this.scene.add.rectangle(x, y, 180, 60, 0x34495e, 0.95);
        profileBg.setStrokeStyle(1, 0x2c3e50, 0.8);
        this.profileContainer.add(profileBg);

        // User info text - only display name
        this.userInfo = this.scene.add.text(x, y - 8, '', {
            fontSize: '16px',
            color: '#ecf0f1',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        this.profileContainer.add(this.userInfo);

        // Logout button with modern styling
        this.logoutButton = this.scene.add.rectangle(x, y + 18, 100, 28, 0xe74c3c);
        this.logoutButton.setStrokeStyle(1, 0xc0392b, 0.8);
        this.logoutText = this.scene.add.text(x, y + 18, 'Logout', {
            fontSize: '13px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Add hover effects
        this.logoutButton.setInteractive({ useHandCursor: true });
        this.logoutButton.on('pointerover', () => {
            this.logoutButton.setFillStyle(0xc0392b);
        });
        this.logoutButton.on('pointerout', () => {
            this.logoutButton.setFillStyle(0xe74c3c);
        });
        this.logoutButton.on('pointerdown', () => this.handleLogout());
        
        this.profileContainer.add([this.logoutButton, this.logoutText]);

        // Listen for authentication state changes
        this.authService.onAuthStateChange((user: AuthUser | null) => {
            this.currentUser = user;
            this.updateUserInfo();
        });

        // Initial update
        this.currentUser = this.authService.getCurrentUser();
        this.updateUserInfo();
    }

    private updateUserInfo() {
        if (this.currentUser) {
            const displayName = this.currentUser.displayName || 'User';
            this.userInfo.setText(displayName);
            this.profileContainer.setVisible(true);
        } else {
            this.profileContainer.setVisible(false);
        }
    }

    private async handleLogout() {
        try {
            await this.authService.signOut();
            // Stop all current scenes and start fresh with LoginScene
            this.scene.scene.stop();
            this.scene.scene.start('LoginScene');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    public setVisible(visible: boolean) {
        this.profileContainer.setVisible(visible);
    }

    public destroy() {
        this.profileContainer.destroy();
    }
}
