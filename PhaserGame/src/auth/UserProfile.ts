import Phaser from 'phaser';
import { AuthService, AuthUser } from './AuthService';
import { GAME_CONFIG } from '../config/GameConstants';

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
    // 🟣 Profile card background (glass-like)
    const bgWidth = 190;
    const bgHeight = 100;
    const radius = 15;

    const profileBg = this.scene.add.graphics();
    profileBg.fillStyle(0xffffff, 0.15); // translucent white
    profileBg.lineStyle(2, 0xffffff, 0.3);
    profileBg.fillRoundedRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight, radius);
    profileBg.strokeRoundedRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight, radius);

    this.profileContainer.add(profileBg);

    // 👤 Username (larger, centered, above logout)
    this.userInfo = this.scene.add.text(x, y - 20, '', {
        fontSize: '18px',
        color: '#6b46c1',
        fontFamily: 'Poppins, Nunito, Arial, sans-serif',
        fontStyle: '700',
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
    }).setOrigin(0.5);
    this.profileContainer.add(this.userInfo);

    // 🔥 Gradient Logout button
    const buttonWidth = 120;
    const buttonHeight = 38;
    const buttonRadius = 10;
    const buttonY = y + 20;

    const logoutContainer = this.scene.add.container(x, buttonY);
    logoutContainer.setSize(buttonWidth, buttonHeight);

    const g = this.scene.add.graphics();
    g.fillGradientStyle(0xff6b6b, 0xff6b6b, 0xc0392b, 0xc0392b, 1, 1, 1, 1);
    g.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);

    this.logoutText = this.scene.add.text(0, 0, 'Logout', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Poppins, Nunito, Arial, sans-serif',
        fontStyle: '700',
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 3, fill: true }
    }).setOrigin(0.5);

    logoutContainer.add([g, this.logoutText]);

    const zone = this.scene.add.zone(0, 0, buttonWidth, buttonHeight)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
    logoutContainer.add(zone);

    // Hover effects
    zone.on('pointerover', () => {
        this.scene.tweens.add({
        targets: logoutContainer,
        scale: 1.1,
        duration: 150,
        ease: 'Back.Out'
        });
    });

    zone.on('pointerout', () => {
        this.scene.tweens.add({
        targets: logoutContainer,
        scale: 1.0,
        duration: 150,
        ease: 'Back.In'
        });
    });

    zone.on('pointerdown', () => {
        this.scene.sound?.play('whoosh', { volume: 0.4 });
        this.handleLogout();
    });

    this.profileContainer.add(logoutContainer);

    // Auth listener
    this.authService.onAuthStateChange((user: AuthUser | null) => {
        this.currentUser = user;
        this.updateUserInfo();
    });

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
