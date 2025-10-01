import { Preloader } from './Preloader';
import { Play } from './Play';
import { GameUI } from './GameUI';
import { GAME_CONFIG } from './config/GameConstants';
import Phaser from 'phaser';

const config = {
    title: 'Card Memory Game',
    type: Phaser.AUTO,
    width: GAME_CONFIG.CANVAS_WIDTH,
    height: GAME_CONFIG.CANVAS_HEIGHT,
    parent: 'game-container',
    backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
    pixelArt: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Preloader,
        Play,
        GameUI
    ]
};

const game = new Phaser.Game(config);

// Expose game instance globally so GameStateManager event system works
if (typeof window !== 'undefined') {
    (window as any).game = game;
}

export default game;