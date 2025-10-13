import Phaser from 'phaser';

/**
 * FeedbackAnimations - Handles visual feedback for correct/incorrect answers
 */
export class FeedbackAnimations {
    private readonly scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Show "Well done!" animation for correct answer
     */
    showCorrectFeedback(): void {
        this.showFeedbackText('Well done!', '#2ecc71', 1.2);
    }

    /**
     * Show "Whoops!" animation for incorrect answer
     */
    showIncorrectFeedback(): void {
        this.showFeedbackText('Whoops!', '#e74c3c', 1.0);
    }

    /**
     * Create and animate feedback text
     */
    private showFeedbackText(message: string, color: string, scaleMultiplier: number): void {
        const { width, height } = this.scene.sys.game.scale;

        // Create text at center of screen
        const feedbackText = this.scene.add.text(width / 2, height / 2, message, {
            fontSize: '64px',
            color: color,
            fontStyle: 'bold',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            stroke: '#ffffff',
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 8,
                fill: true
            }
        })
            .setOrigin(0.5)
            .setDepth(10000) // Ensure it's on top of everything
            .setAlpha(0)
            .setScale(0.5);

        // Animation sequence
        this.scene.tweens.add({
            targets: feedbackText,
            alpha: 1,
            scale: scaleMultiplier,
            y: height / 2 - 50, // Move up slightly
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Hold for a moment
                this.scene.time.delayedCall(1400, () => {
                    // Fade out and move up
                    this.scene.tweens.add({
                        targets: feedbackText,
                        alpha: 0,
                        y: height / 2 - 100,
                        scale: scaleMultiplier * 0.8,
                        duration: 300,
                        ease: 'Power2.easeIn',
                        onComplete: () => {
                            feedbackText.destroy();
                        }
                    });
                });
            }
        });

        // Add a subtle bounce effect
        this.scene.tweens.add({
            targets: feedbackText,
            scale: scaleMultiplier * 1.1,
            duration: 150,
            delay: 300,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Clean up any active feedback animations
     */
    destroy(): void {
        // Cleanup handled by individual tween callbacks
    }
}

