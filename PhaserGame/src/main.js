import { Preloader } from './Preloader';
import { Play } from './Play';
import { GameUI } from './GameUI';
import Phaser from 'phaser';

const config = {
    title: 'Card Memory Game',
    type: Phaser.AUTO,
    width: 1100,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#f8f8ff',
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

new Phaser.Game(config);
