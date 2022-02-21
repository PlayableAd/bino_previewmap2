class Scene1PlayGame extends Phaser.Scene {
    constructor() {
        super({ key: 'Scene1PlayGame' });
    }

    create() {
        isControllable = true;
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.map = this.make.tilemap({ key: "map" });
        this.groundTiles = this.map.addTilesetImage("tile_mario", "sprTileMap");
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'sprBackground').setScrollFactor(0).setOrigin(0, 0);

        this.background1 = this.map.createDynamicLayer("BG", this.groundTiles, 0, 0);
        this.front = this.map.createDynamicLayer("Front", this.groundTiles, 0, 0).setDepth(2);
        this.groundLayer = this.map.createDynamicLayer("World", this.groundTiles, 0, 0).setCollisionByExclusion([-1]);

        this.trap = this.map.createDynamicLayer("Trap", this.groundTiles, 0, 0).setCollisionByExclusion([-1]);
        this.finishPoint = this.map.createDynamicLayer("FinishPoint", this.groundTiles, 0, 0).setCollisionByExclusion([-1]);

        this.coinsGroup = this.physics.add.group();
        this.attackGroup = this.physics.add.group();
        this.blockCoin = this.physics.add.group();
        this.stairGroup = this.physics.add.group();
        this.elevatorGroup = this.physics.add.group();
        this.enemiesGroup = this.physics.add.group();

        this.blockCoin.defaults.setAllowGravity = false;
        this.coinsGroup.defaults.setAllowGravity = false;
        this.attackGroup.defaults.setAllowGravity = false;
        this.stairGroup.defaults.setAllowGravity = false;
        this.elevatorGroup.defaults.setAllowGravity = false;
        this.enemiesGroup.defaults.setAllowGravity = false;

        this.map.getObjectLayer("PlayerPosition").objects.forEach((player) => {
            this.player = new Player(this, player.x, player.y, "sprMovementPlayer").setDepth(3);
            this.physics.add.collider(this.player, this.groundLayer);
            this.physics.add.collider(this.player, this.trap, this.standOnTrap, null, this);
        });

        this.map.getObjectLayer("Coins").objects.forEach((coin) => {
            this.coin = new Coins(this, coin.x, coin.y, "sprCoinMotion");
            this.coinsGroup.add(this.coin);
            this.physics.add.overlap(this.coinsGroup, this.player, this.collectCoins, null, this);
        });

        this.map.getObjectLayer("Enemies").objects.forEach((enemyData) => {
            var nameEnemy = this.getPropertiesObject(enemyData.properties, {
                name: "nameEnemy",
            }).value;
            var moveType = this.getPropertiesObject(enemyData.properties, {
                name: "moveType",
            }).value;
            var long = this.getPropertiesObject(enemyData.properties, {
                name: "long",
            }).value;
            this.enemy = new Enemy(this, enemyData.x, enemyData.y, nameEnemy);
            if (moveType === "right") {
                this.enemy.flipX = true;
                this.tweens.add({
                    targets: this.enemy,
                    props: {
                        x: {
                            value: enemyData.x + long,
                            duration: 3000,
                            flipX: true,
                        },
                    },
                    ease: "Linear",
                    yoyo: true,
                    repeat: -1,
                });
            } else if (moveType === "left") {
                this.tweens.add({
                    targets: this.enemy,
                    props: {
                        x: {
                            value: enemyData.x + long,
                            duration: 3000,
                            flipX: true,
                        },
                    },
                    ease: "Linear",
                    yoyo: true,
                    repeat: -1,
                });
            } else if (moveType === "up") {
                this.tweens.add({
                    targets: this.enemy,
                    props: {
                        y: {
                            value: enemyData.y + long,
                            duration: 3000,
                            flipX: true,
                        },
                    },
                    ease: "Linear",
                    yoyo: true,
                    repeat: -1,
                });
            } else if (moveType === "down") {
                this.tweens.add({
                    targets: this.enemy,
                    props: {
                        y: {
                            value: enemyData.y + long,
                            duration: 2000,
                            flipX: true,
                        },
                    },
                    ease: "Linear",
                    yoyo: true,
                    repeat: -1,
                });
            }

            this.physics.add.collider(this.enemy, this.player, this.impactEnemy, null, this);
            this.physics.add.collider(this.enemy, this.attackGroup, this.attackEnemy, null, this);
            this.enemiesGroup.add(this.enemy);
            this.physics.add.collider(this.enemy, this.groundLayer);
        });

        this.map.getObjectLayer("BonusPoints").objects.forEach((blockData) => {
            this.block = new BonusPoint(this, blockData.x, blockData.y);

            var coinQuantity = this.getPropertiesObject(blockData.properties, {
                name: "coinQuantity",
            });
            this.block.setDepth(1);
            this.block.body.moves = false;
            this.physics.add.collider(this.enemiesGroup, this.block, (block, enemy) => {
                this.playSound("standOnEnemySound");
                enemy.play(enemy.texture.key + "DeadMotion");
                if (enemy.texture.key === "sprFlowerEnemy") {
                    enemy.setData("isDead", true);
                } else {
                    enemy.on("animationcomplete", function () {
                        enemy.setData("isDead", true);
                    });
                }
            });
            this.physics.add.collider(this.player, this.block, (player, block) => {
                if (block.body.touching.down) {
                    if (coinQuantity.value > 0) {
                        coinQuantity.value -= 1;
                        this.playSound("hitBonusBlockSound");
                        this.tweens.add({
                            targets: [block],
                            ease: "Linear",
                            y: block.body.y - 20,
                            duration: 150,
                            yoyo: true,
                            repeat: 0,
                            onComplete: () => {
                                if (coinQuantity.value === 0 || coinQuantity.value === undefined) {
                                    block.setFrame(4);
                                    block.setData("isDead", true);
                                    block.anims.stop();
                                    this.coinBlock.setData("isDead", true);
                                }
                            },
                        });
                        this.coinBlock = new Coins(this, block.x, block.y + 25, "sprCoinMotion");
                        this.coinBlock.body.setAllowGravity(false);
                        this.coinBlock.setDepth(0);
                        this.blockCoin.add(this.coinBlock);
                        this.tweens.add({
                            targets: this.coinBlock,
                            delay: 0,
                            props: {
                                y: {
                                    value: this.coinBlock.y - 70,
                                    duration: 300,
                                    flipX: false,
                                },
                            },
                            ease: "Linear",
                            repeat: 0,
                            onComplete: () => {
                                this.coinBlock.setVisible(false);
                                this.coinBlock.setData("isDead", true);
                            },
                        });
                    }
                    player.body.velocity.y = 100;
                } else if (isJump && block.body.touching.up) {
                    this.player.body.setVelocityY(-650);
                    this.playSound("jumpSound");
                } else if (this.cursors.up.isDown && block.body.touching.up) {
                    this.player.body.setVelocityY(-650);
                    this.playSound("jumpSound");
                }
            });
        });

        this.map.getObjectLayer("Princess").objects.forEach((princessData) => {
            this.princess = new Princess(this, princessData.x, princessData.y, "sprPrincessPlayer");
            this.princess.play("sprPrincessCryMotion");
            this.physics.add.collider(this.princess, this.groundLayer);
            this.physics.add.overlap(this.player, this.princess, this.impactPrincess, null, this);
        });

        this.map.getObjectLayer("Bell").objects.forEach((bellData) => {
            this.bell = new AssetMotion(this, bellData.x, bellData.y, 'sprBell').setOrigin(0.5, 0);
        });

        this.map.getObjectLayer("Elevators").objects.forEach((elevatorData) => {
            var moveType = this.getPropertiesObject(elevatorData.properties, {
                name: "moveType",
            }).value;
            this.elevator = new Elevators(this, elevatorData.x, elevatorData.y);
            this.elevator.body.setImmovable(true);
            if (moveType === "up") {
                this.elevator.setData("moveType", moveType);
            } else if (moveType === "down") {
                this.elevator.setData("moveType", moveType);
            }
            this.elevatorGroup.add(this.elevator);

            this.colliderStair = this.physics.add.collider(this.stairGroup, this.player, (player, stair) => {
                stair.body.velocity.x = 0;
                stair.body.velocity.y = 0;
                stair.body.setImmovable(true);
                if (isJump && stair.body.touching.up) {
                    player.body.setVelocityY(-650);
                    this.playSound("jumpSound");
                } else if (this.cursors.up.isDown && stair.body.touching.up) {
                    player.body.setVelocityY(-650);
                    this.playSound("jumpSound");
                }
            });
        });

        this.physics.add.collider(this.player, this.finishPoint, this.impactFinishPoint, null, this);
        this.physics.add.collider(this.attackGroup, this.groundLayer, this.bulletImpactGround, null, this);

        this.tapToPlay = new AssetStatic(this, this.game.scale.width / 2, this.game.scale.height / 2, 'sprTapToPlay').setScrollFactor(0).setDepth(4).setScale(2).setVisible(false);
        this.tweens.add({
            targets: this.tapToPlay,
            duration: 500,
            alpha: {
                getStart: () => 0.5,
                getEnd: () => 1,
            },
            ease: "Linear",
            yoyo: true,
            repeat: -1,
        });
        this.gameOver = new AssetStatic(this, this.game.scale.width / 2, this.game.scale.height / 2, "sprGameOver").setAlpha(0).setScale(0.1).setDepth(3).setInteractive().setScrollFactor(0);
        this.gameWin = new AssetStatic(this, this.game.scale.width / 2, this.game.scale.height / 2, "sprGameWin").setAlpha(0).setScale(0.1).setDepth(3).setInteractive().setScrollFactor(0);
        this.downloadNow = new AssetMotion(this, this.game.scale.width / 2, 40, "sprDownloadNow").setDepth(3).setInteractive().setVisible(false).setScrollFactor(0);
        disableBgSound = new AssetStatic(this, 30, 30, "sprMute").setFrame(0).setDepth(3).setInteractive().setScrollFactor(0);
        disableBgSound.on("pointerdown", function (event) {
            if (Sounds["bgSound"].playing()) {
                isMuted = true;
                Sounds["bgSound"].pause();
                disableBgSound.setFrame(1);
            } else {
                isMuted = true;
                Sounds["bgSound"].play();
                disableBgSound.setFrame(0);
            }
        });
        this.downloadNow.on("pointerdown", function () {
            window.install && window.install();
        });

        this.turnLeft = new AssetStatic(this, this.game.scale.width / 12, this.cameras.main.height - 30, "sprController")
            .setDepth(3)
            .setScrollFactor(0)
            .setFrame(0)
            .setScale(1)
            .setVisible(false)
            .setInteractive({ draggable: true });
        this.turnRight = new AssetStatic(this, this.game.scale.width / 12 + 90, this.cameras.main.height - 30, "sprController")
            .setDepth(3)
            .setScrollFactor(0)
            .setFrame(2)
            .setScale(1)
            .setVisible(false)
            .setInteractive({ draggable: true });
        this.jump = new AssetStatic(this, this.game.scale.width / 1.09, this.cameras.main.height - 30, "sprController")
            .setDepth(3)
            .setScrollFactor(0)
            .setFrame(4)
            .setScale(1)
            .setVisible(false)
            .setInteractive({ draggable: true });
        this.fire = new AssetStatic(this, this.game.scale.width / 1.09 - 90, this.cameras.main.height - 30, "sprController")
            .setDepth(3)
            .setScrollFactor(0)
            .setFrame(6)
            .setScale(1)
            .setVisible(false)
            .setInteractive({ draggable: true });

        this.turnLeft
            .on("pointerdown", function () {
                isTurnLeft = true;
            })
            .on("pointerout", function () {
                isTurnLeft = false;
            });

        this.turnRight
            .on("pointerdown", function () {
                isTurnRight = true;
            })
            .on("pointerout", function () {
                isTurnRight = false;
            });

        this.jump
            .on("pointerdown", function () {
                isJump = true;
            })
            .on("pointerout", function () {
                isJump = false;
            });

        this.fire
            .on("pointerdown", function () {
                isFire = true;
            })
            .on("pointerout", function () {
                isFire = false;
            });

        this.physics.world.bounds.width = this.groundLayer.width;
        this.physics.world.bounds.height = this.groundLayer.height;

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.scrollX = this.princess.x - 300;
        this.cameras.main.scrollY = this.princess.y;
        this.cameras.main.startFollow(this.princess);
        this.cameras.main.zoomTo(2, 2000);
        this.cameras.main.pan(this.princess.x, this.princess.y + 16, 3500, "Sine.easeInOut");
        timePasue1 = this.time.addEvent({
            delay: 1000,
            callback: function () {
                this.cameras.main.stopFollow(this.princess);
                this.cameras.main.zoomTo(1, 2000);
                this.cameras.main.pan(0, this.groundLayer.height, 3000, "Sine.easeInOut");
            },
            callbackScope: this,
            repeat: 0,
        });
        timePause2 = this.time.addEvent({
            delay: 4000,
            callback: function () {
                this.fire.setVisible(true);
                this.turnRight.setVisible(true);
                this.turnLeft.setVisible(true);
                this.jump.setVisible(true);
                this.downloadNow.setVisible(true);
                this.cameras.main.startFollow(this.player);
            },
            callbackScope: this,
            repeat: 0,
        });
        this.time.addEvent({
            delay: 4000,
            callback: function () {
                this.tapToPlay.setVisible(true);
                this.input.on("pointerdown", function () {
                    isTap = true;
                    if (!Sounds["bgSound"].playing() && this.scene.player.getData("isDead") !== undefined && !this.scene.player.getData("isDead") && !isMuted) {
                        Sounds["bgSound"].play();
                        timePasue1.paused = false;
                        timePause2.paused = false;
                    }
                });
            },
            callbackScope: this,
            repeat: 0,
        });
        timePasue1.paused = true;
        timePause2.paused = true;
        this.cameras.main.roundPixels = true;
        this.cameras.main.pixelArt = true;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.sound.pauseOnBlur = false;
        this.game.events.on(Phaser.Core.Events.BLUR, () => {
            this.handleLoseFocus();
        });

        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) {
                return;
            }
            this.handleLoseFocus();
        });

        this.scale.on("resize", this.resize, this);
    }

    resize(gameSize, baseSize, displaySize, resolution) {
        var width = gameSize.width;
        var height = gameSize.height;
        this.cameras.resize(width, height);
        this.background.setSize(width, height);
        this.tapToPlay.setPosition(width / 2, height / 2);
        this.gameWin.setPosition(width / 2, height / 2);
        this.gameOver.setPosition(width / 2, height / 2);
        this.turnLeft.setPosition(width / 12, height - 40);
        this.turnRight.setPosition(width / 12 + 90, height - 40);
        this.jump.setPosition(width / 1.09, height - 40);
        this.fire.setPosition(width / 1.09 - 90, height - 40);
        this.downloadNow.setPosition(width / 2, 30);
        disableBgSound.setPosition(30, 30);
    }

    handleLoseFocus() {
        if (this.scene.isActive("paused")) {
            return;
        }
        Sounds["bgSound"].pause();

        this.scene.run("paused", {
            onResume: () => {
                this.scene.stop("paused");
                Sounds["bgSound"].resume();
            },
        });
    }

    bulletImpactGround(bullet, ground) {
        bullet.destroy();
    }

    collectCoins(player, coin) {
        if (coin) {
            coin.destroy();
            this.playSound("collectCoinSound");
        }
    }

    impactEnemy(enemy, player) {
        if (!enemy.getData("isDead")) {
            if (enemy.body.touching.up) {
                this.playSound("standOnEnemySound");
                enemy.play(enemy.texture.key + "DeadMotion");
                if (enemy.texture.key === "sprFlowerEnemy") {
                    enemy.setData("isDead", true);
                } else {
                    enemy.on("animationcomplete", function () {
                        enemy.setData("isDead", true);
                    });
                }
                player.body.velocity.y = -300;
            } else {
                if (!player.getData("isDead")) {
                    player.play("sprPlayerDeadMotion");
                    player.setData("isDead", true);
                    isControllable = false;
                    enemy.body.velocity.x = 0;
                    enemy.body.velocity.y = 0;
                    enemy.body.setImmovable(true);
                    player.on("animationcomplete", function () {
                        player.body.setImmovable(true);
                        player.body.velocity.y = -300;
                        player.body.velocity.x = 0;
                    });
                    this.time.addEvent({
                        delay: 500,
                        callback: function () {
                            player.onFailure(this.gameOver);
                            endGame = true;
                        },
                        callbackScope: this,
                        repeat: 0,
                    });
                }
            }
        }
    }

    attackEnemy(enemy, attack) {
        if (!enemy.getData("isDead")) {
            enemy.play(enemy.texture.key + "DeadMotion");
        }
        var blow = this.add.sprite(enemy.x, enemy.y + 10).play("sprImpactMotion");
        this.playSound("standOnEnemySound");
        if (enemy.texture.key === "sprFlowerEnemy") {
            enemy.setData("isDead", true);
        } else {
            enemy.on("animationcomplete", function () {
                enemy.setData("isDead", true);
            });
        }
        blow.on("animationcomplete", function () {
            blow.destroy();
        });
        attack.destroy();
    }

    impactFinishPoint(player, finishPoint) {
        player.anims.play("sprTurnMotion", true);
        this.finishPoint.setCollisionByExclusion([0]);
        player.body.velocity.x = 100;
        this.add.tween({
            targets: [player, this.princess],
            ease: "Sine.easeInOut",
            duration: 800,
            delay: 0,
            alpha: {
                getStart: () => 1,
                getEnd: () => 0,
            },
            repeat: 0,
            yoyo: false,
            loop: 0,
            onComplete: () => {
                // player.onSuccessfuly(this.gameWin);
                this.scene.start('Scene2PlayGame');
                // endGame = true;
            },
        });
    }

    impactPrincess(player, princess) {
        isControllable = false;
        player.body.velocity.x = 100;
        // this.playSound("flagSound");
        this.time.addEvent({
            delay: 200,
            callback: function () {
                player.body.velocity.x = 100;
                player.anims.play("sprTurnMotion", true);
            },
            callbackScope: this,
            repeat: 0,
        });
        this.time.addEvent({
            delay: 900,
            callback: function () {
                princess.body.velocity.x = 100;
                princess.anims.play("sprPrincessMoveMotion", true);
            },
            callbackScope: this,
            repeat: 0,
        });
    }

    standOnTrap(player, trap) {
        if (!player.getData("isDead")) {
            this.trap.setCollisionByExclusion([0]);
            player.body.velocity.y = 100;
            player.setData("isDead", true);
            isUpgrade ? player.anims.play("sprPlayerDeadUpgradeMotion", true) : player.play("sprPlayerDeadMotion");
            player.on("animationcomplete", function () {
                player.body.setImmovable(true);
            });
            // player.onFailure(this.gameOver, this.tryAgain);
            endGame = true;
        }
    }

    hitPlayer(player, bullet) {
        bullet.destroy();
        player.body.velocity.y = 100;
        player.setData("isDead", true);
        isUpgrade ? player.anims.play("sprPlayerDeadUpgradeMotion", true) : player.play("sprPlayerDeadMotion");
        player.on("animationcomplete", function () {
            player.body.setImmovable(true);
        });
        player.defaults.setAllowGravity = false;
        player.setImmovable(false);
        // player.onFailure(this.gameOver, this.tryAgain);
        endGame = true;
    }

    playSound(name) {
        Sounds[name].currentTime = 0;
        Sounds[name].play();
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
            this.player.update();
            if (isTap) {
                this.tapToPlay.setVisible(false);
            }
            if (this.player.getData("isDead")) {
                Sounds["bgSound"].pause();
            }
            if (endGame) {
                this.downloadNow.setVisible(false);
                window.gameEnd && window.gameEnd();
                /*GameEndVungle*/
                this.input.on("pointerdown", function () {
                    window.install && window.install();
                });
            }
            for (var i = 0; i < this.enemiesGroup.getChildren().length; i++) {
                var enemy = this.enemiesGroup.getChildren()[i];
                enemy.update();
            }
            for (var i = 0; i < this.stairGroup.getChildren().length; i++) {
                var stair = this.stairGroup.getChildren()[i];
                stair.update();
            }
            for (var i = 0; i < this.blockCoin.getChildren().length; i++) {
                var coin = this.blockCoin.getChildren()[i];
                coin.update();
            }
            for (var i = 0; i < this.attackGroup.getChildren().length; i++) {
                var bulletPlayer = this.attackGroup.getChildren()[i];
                bulletPlayer.update();
            }
            for (var i = 0; i < this.elevatorGroup.getChildren().length; i++) {
                var elevator = this.elevatorGroup.getChildren()[i];
                elevator.update();
            }
        }
    }
}
function gameClose() {}
