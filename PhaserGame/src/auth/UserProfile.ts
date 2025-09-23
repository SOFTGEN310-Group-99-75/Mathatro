import Phaser from 'phaser';
import { AuthService, AuthUser } from './AuthService';

export class UserProfile {
    private readonly scene: Phaser.Scene;
    private readonly authService: AuthService;
    private readonly profileContainer: Phaser.GameObjects.Container;
    private userInfo: Phaser.GameObjects.Text;
    private logoutButton: Phaser.GameObjects.Rectangle;
    private logoutText: Phaser.GameObjects.Text;
    private currentUser: AuthUser | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.authService = AuthService.getInstance();
        this.profileContainer = scene.add.container(0, 0);
        this.profileContainer.setDepth(1000); // Ensure it's on top
    }

    public create(x: number, y: number) {
        // Profile background
        const profileBg = this.scene.add.rectangle(x, y, 200, 80, 0x2c3e50, 0.9);
        profileBg.setStrokeStyle(2, 0xecf0f1);
        this.profileContainer.add(profileBg);

        // User info text
        this.userInfo = this.scene.add.text(x, y - 15, '', {
            fontSize: '14px',
            color: '#ecf0f1',
            align: 'center'
        }).setOrigin(0.5);
        this.profileContainer.add(this.userInfo);

        // Logout button
        this.logoutButton = this.scene.add.rectangle(x, y + 20, 120, 25, 0xe74c3c);
        this.logoutText = this.scene.add.text(x, y + 20, 'Logout', {
            fontSize: '12px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.logoutButton.setInteractive();
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
            const email = this.currentUser.email || '';
            this.userInfo.setText(`${displayName}\n${email}`);
            this.profileContainer.setVisible(true);
        } else {
            this.profileContainer.setVisible(false);
        }
    }

    private async handleLogout() {
        try {
            await this.authService.signOut();
            // The scene should handle the logout by switching back to login
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
