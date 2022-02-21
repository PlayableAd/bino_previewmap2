var bloodBoss = 4000;
var damgeBoss = 1000;
var bloodPlayer = 4000;
var damgePlayer = 500;
class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
        scene.physics.world.enableBody(this, 0);
        this.body.setCollideWorldBounds(true);
        scene.add.existing(this);
        this.setData("isDead", false);
    }
}

class Player extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprMovementPlayer");
        this.setDepth(2);
        this.body.acceleration.y = 700;
        this.body.setSize(32, 64);
        this.setData("isShooting", false);
        this.setData("timerShootDelay", 20);
        this.setData("timerShootTick", this.getData("timerShootDelay") - 1);
        console.log(this)

    }

    update() {
        var player = this;
        if (!this.getData("isDead") && isControllable && this.getData("isDead") !== undefined) {
            if (this.scene.sys.game.device.os.desktop) {
                if (this.scene.cursors.right.isDown) {
                    player.body.setVelocityX(300);
                    player.anims.play("sprTurnMotion", true);
                    player.flipX = false;
                } else if (this.scene.cursors.left.isDown) {
                    player.body.setVelocityX(-300);
                    player.anims.play("sprTurnMotion", true);
                    player.flipX = true;
                } else if (this.scene.cursors.space.isDown) {
                    if (player.getData("timerShootTick") < player.getData("timerShootDelay")) {
                        player.setData("timerShootTick", player.getData("timerShootTick") + 1);
                    } else {
                        this.scene.playSound("attackSound");
                        if (player.flipX === false) {
                            player.attack = new PlayerWeapon(player.scene, player.body.x + 40, player.body.y + 40).setDepth(4);
                            player.attack.flipX = false;
                            player.attack.setData("isFlip", false);
                        } else {
                            player.attack = new PlayerWeapon(player.scene, player.body.x - 35, player.body.y + 40).setDepth(4);
                            player.attack.flipX = true;
                            player.attack.setData("isFlip", true);
                        }
                        player.setData("timerShootTick", 0);
                        player.scene.attackGroup.add(player.attack);
                    }
                } else {
                    player.body.velocity.x = 0;
                    player.anims.play("sprIdleMotion");
                }

                if (player.scene.cursors.up.isDown && player.body.onFloor() && player.body.velocity.y >= 0) {
                    player.body.setVelocityY(-800);
                    player.anims.play("sprPlayerJumpMotion");
                    this.scene.playSound("jumpSound");
                }
                if (player.body.velocity.y >= 0 && !player.body.onFloor()) {
                    player.anims.play("sprPlayerJumpMotion");
                } else if (!player.body.onFloor()) {
                    player.anims.play("sprPlayerJumpMotion");
                }
            } else {
                if (isTurnRight) {
                    player.body.setVelocityX(300);
                    player.anims.play("sprTurnMotion", true);
                    player.flipX = false;
                } else if (isTurnLeft) {
                    player.body.setVelocityX(-300);
                    player.anims.play("sprTurnMotion", true);
                    player.flipX = true;
                } else if (isFire) {
                    if (player.getData("timerShootTick") < player.getData("timerShootDelay")) {
                        player.setData("timerShootTick", player.getData("timerShootTick") + 1);
                    } else {
                        this.scene.playSound("attackSound");
                        if (player.flipX === false) {
                            player.attack = new PlayerWeapon(player.scene, player.body.x + 40, player.body.y + 40).setDepth(4);
                            player.attack.flipX = false;
                            player.attack.setData("isFlip", false);
                        } else {
                            player.attack = new PlayerWeapon(player.scene, player.body.x - 35, player.body.y + 40).setDepth(4);

                            player.attack.flipX = true;
                            player.attack.setData("isFlip", true);
                        }
                        player.setData("timerShootTick", 0);
                        player.scene.attackGroup.add(player.attack);
                    }
                } else {
                    player.body.velocity.x = 0;
                    player.anims.play("sprIdleMotion");
                }

                if (isJump && player.body.onFloor() && player.body.velocity.y >= 0) {
                    player.body.setVelocityY(-650);
                    player.anims.play("sprPlayerJumpMotion");
                    this.scene.playSound("jumpSound");
                }
                if (player.body.velocity.y >= 0 && !player.body.onFloor()) {
                    player.anims.play("sprPlayerJumpMotion");
                } else if (!player.body.onFloor()) {
                    player.anims.play("sprPlayerJumpMotion");
                }
            }
        }

        if (this.getData("isDead")) {
            this.scene.physics.world.removeCollider(this.scene.colliderStair);
            this.scene.time.addEvent({
                delay: 500,
                callback: function () {
                    player.destroy();
                },
                callbackScope: this,
                repeat: 0,
            });
        }
    }

    onFailure(gameOver) {
        console.log(gameOver)
        let thatttt = this;
        this.scene.playSound("loseSound");
        Sounds["bgSound"].pause();
        this.scene.turnRight.setVisible(false);
        this.scene.turnLeft.setVisible(false);
        this.scene.jump.setVisible(false);
        this.scene.fire.setVisible(false);
        this.scene.add.tween({
            targets: gameOver,
            ease: "Sine.easeInOut",
            duration: 500,
            delay: 500,
            scale: 1,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1,
            },
            repeat: 0,
            yoyo: false,
            onComplete: () => {
                gameOver.scene.input.on("pointerdown", function () {
                    window.install && window.install();
                    console.log("GOTOSTORE")
                });
            },
        });
    }

    onSuccessfuly(gameWin) {
        console.log('check')
        this.scene.playSound("winSound");
        Sounds["bgSound"].pause();
        this.scene.turnRight.setVisible(false);
        this.scene.turnLeft.setVisible(false);
        this.scene.jump.setVisible(false);
        this.scene.fire.setVisible(false);
        this.scene.add.tween({
            targets: gameWin,
            ease: "Sine.easeInOut",
            duration: 500,
            delay: 0,
            scale: 1,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1,
            },
            repeat: 0,
            yoyo: false,
            onComplete: () => {
                this.scene.start('Scene2PlayGame');
            },
        });
    }
}

class Princess extends Entity {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        this.setDepth(2);
        this.body.setSize(60, 95);
    }
}

class PlayerWeapon extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprPlayerWeapon');
        this.play("sprPlayerWeaponMotion");
        this.setData("isFlip", false);
    }

    update() {
        if (this.getData("isFlip")) {
            this.body.setVelocityX(-250);
        } else {
            this.body.setVelocityX(250);
        }
    }
}

class Coins extends Entity {
    constructor(scene, x, y, typeCoin) {
        super(scene, x + 15, y, typeCoin);
        this.play("sprCoinMotion");
    }
    update() {
        if (this.getData("isDead")) {
            this.destroy();
        }
    }
}

class Enemy extends Entity {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.body.allowGravity = false;
        this.setOrigin(0.5, 0);
        this.play(texture + "Motion");
    }
    update() {
        if (this.getData("isDead")) {
            this.destroy();
            console.log("check");
        }
    }
}

class BonusPoint extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprBonusPoint");
        this.setOrigin(0, 0);
        this.body.setImmovable(true);
        this.body.setSize(20, 32, true).setOffset(6, 1);
        this.play("sprBonusPointMotion");
    }
    update() {
        console.log(this.getData("isDead"));
        if (this.getData("isDead")) {
            this.anims.stop();
        }
    }
}


class StairElevator extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, "sprElevartor");
        this.setOrigin(0.31, 0);
        this.body.setImmovable(true);
    }

    update() {
        this.body.setVelocityX(0);
        if (this.getData("moveType") === "up") {
            this.body.setVelocityY(150);
        } else if (this.getData("moveType") === "down") {
            this.body.setVelocityY(-150);
        }
    }
}

class AssetStatic extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
    }
}

class AssetMotion extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        this.play(sprite + "Motion");
    }
}

class Springs extends Entity {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        if (sprite === "sprSprings") {
            this.setDepth(3);
        } else {
            this.setDepth(0);
        }
    }
}