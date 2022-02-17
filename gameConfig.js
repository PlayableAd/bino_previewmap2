var game;

var config = {
    type: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? Phaser.CANVAS : Phaser.AUTO,
    backgroundColor: "black",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 0, y: 1400 },
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    
    scene: [Preload, Scene1PlayGame, Scene2PlayGame ],
    audio: {
        disableWebAudio: true,
    },
    input: {
        activePointers: 3,
    },
    roundPixels: true,
    pixelArt: true
};
game = new Phaser.Game(config);

