import Phaser from 'phaser';
import { AuthService, AuthUser } from './AuthService';

export class UserProfile {
    private readonly scene: Phaser.Scene;
    private readonly authService: AuthService;
    private readonly profileContainer: Phaser.GameObjects.Container;
    private userInfo: Phaser.GameObjects.Text;
    private logoutButton: Phaser.GameObjects.Graphics;
    private logoutText: Phaser.GameObjects.Text;
    private currentUser: AuthUser | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.authService = AuthService.getInstance();
        this.profileContainer = scene.add.container(0, 0);
        this.profileContainer.setDepth(1000); // Ensure it's on top
    }

    public create(x: number, y: number) {
        // Profile background with rounded corners
        const bgWidth = 180;
        const bgHeight = 60;
        const bgRadius = 12;

        const profileBg = this.scene.add.graphics();
        profileBg.fillStyle(0x34495e, 0.95);
        profileBg.lineStyle(1, 0x2c3e50, 0.8);
        profileBg.fillRoundedRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight, bgRadius);
        profileBg.strokeRoundedRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight, bgRadius);
        this.profileContainer.add(profileBg);

        // User info text - only display name
        this.userInfo = this.scene.add.text(x, y - 12, '', {
            fontSize: '16px',
            color: '#ecf0f1',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        this.profileContainer.add(this.userInfo);

        // Logout button with rounded corners
        const buttonWidth = 100;
        const buttonHeight = 28;
        const borderRadius = 8;
        const buttonY = y + 12; // Moved up from y + 18

        this.logoutButton = this.scene.add.graphics();
        this.logoutButton.fillStyle(0xe74c3c, 1);
        this.logoutButton.lineStyle(1, 0xc0392b, 0.8);
        this.logoutButton.fillRoundedRect(x - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        this.logoutButton.strokeRoundedRect(x - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);

        this.logoutText = this.scene.add.text(x, buttonY, 'Logout', {
            fontSize: '13px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add hover effects
        const hitArea = new Phaser.Geom.Rectangle(
            x - buttonWidth / 2,
            buttonY - buttonHeight / 2,
            buttonWidth,
            buttonHeight
        );

        this.logoutButton.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        this.logoutButton.input!.cursor = 'pointer';

        this.logoutButton.on('pointerover', () => {
            this.logoutButton.clear();
            this.logoutButton.fillStyle(0xc0392b, 1);
            this.logoutButton.lineStyle(1, 0xc0392b, 0.8);
            this.logoutButton.fillRoundedRect(x - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
            this.logoutButton.strokeRoundedRect(x - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        });
        this.logoutButton.on('pointerout', () => {
            this.logoutButton.clear();
            this.logoutButton.fillStyle(0xe74c3c, 1);
            this.logoutButton.lineStyle(1, 0xc0392b, 0.8);
            this.logoutButton.fillRoundedRect(x - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
            this.logoutButton.strokeRoundedRect(x - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
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
