class Scene2PlayGame extends Phaser.Scene {
    constructor() {
        super({ key: 'Scene2PlayGame' });
    }

    create() {
        isControllable = true;
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.map = this.make.tilemap({ key: "map2" });
        this.groundTiles = this.map.addTilesetImage("tile_mario", "sprTileMap2");
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, "sprBackground2").setScrollFactor(0).setOrigin(0, 0);

        this.background1 = this.map.createDynamicLayer("BG", this.groundTiles, 0, 0);
        this.front = this.map.createDynamicLayer("Front", this.groundTiles, 0, 0).setDepth(2);
        this.groundLayer = this.map.createDynamicLayer("World", this.groundTiles, 0, 0).setCollisionByExclusion([-1]).setDepth(2);

        this.stairGroup = this.physics.add.group();

        this.stairGroup.defaults.setAllowGravity = false;
        this.tapToPlay2 = new AssetStatic(this, this.game.scale.width / 2, this.game.scale.height / 2, "sprTapToPlay2").setScrollFactor(0).setDepth(3);
        this.tweens.add({
            targets: this.tapToPlay2,
            duration: 500,
            alpha: {
                getStart: () => 0.5,
                getEnd: () => 1,
            },
            ease: "Linear",
            yoyo: true,
            repeat: -1,
        });

        this.map.getObjectLayer("Princess").objects.forEach((princessData) => {
            this.princess = new Princess(this, princessData.x, princessData.y, "sprPrincessPlayer");
            this.case = new AssetStatic(this, princessData.x, princessData.y - 25, "sprCase").setDepth(3);

            this.physics.world.enableBody(this.case, 0);
            this.case.body.setCollideWorldBounds(true);
            this.case.body.setImmovable(true);
            this.princess.play("sprPrincessCryMotion");
            this.physics.add.collider(this.princess, this.groundLayer);
            this.physics.add.collider(this.case, this.groundLayer);
        });

        this.physics.world.bounds.width = this.groundLayer.width;
        this.physics.world.bounds.height = this.groundLayer.height;

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels - 40);
        this.cameras.main.scrollX = this.princess.x - 300;
        this.cameras.main.scrollY = this.princess.y;
        this.cameras.main.startFollow(this.princess);
        this.cameras.main.zoomTo(1.5, 1000);
        this.cameras.main.pan(this.princess.x, this.princess.y, 1500, "Sine.easeInOut");

        this.cameras.main.on(Phaser.Cameras.Scene2D.Events.ZOOM_COMPLETE, () => {
            this.time.addEvent({
                delay: 500,
                callback: function () {
                    this.tapToPlay2.setVisible(true);
                    this.input.on("pointerdown", function () {
                        console.log("GOTOSTORE")
                    });
                },
                callbackScope: this,
                repeat: 0,
            });
        });
        this.cameras.main.roundPixels = true;
        this.cameras.main.pixelArt = true;

        this.scale.on("resize", this.resize, this);
    }

    resize(gameSize, baseSize, displaySize, resolution) {
        var width = gameSize.width;
        var height = gameSize.height;

        this.cameras.resize(width, height);
        this.background.setSize(width, height);
        this.tapToPlay2.setPosition(width / 2, height / 2);
        disableBgSound.setPosition(30, 30);
    }

    getPropertiesObject(objectData, varTexture, defaultValue = null) {
        var data;
        for (var properties of objectData) {
            data = properties;
            for (var key in varTexture) {
                if (properties[key] !== varTexture[key]) {
                    data = null;
                }
            }
            if (data === null) continue;
            else break;
        }
        if (data === null) return defaultValue;
        else return data;
    }

    update() {
        if (nLoaded >= nAssets) {
            for (var i = 0; i < this.stairGroup.getChildren().length; i++) {
                var stair = this.stairGroup.getChildren()[i];
                stair.update();
            }
        }
    }
}
function gameClose() { }
