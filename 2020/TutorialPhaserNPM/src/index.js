import Phaser from "phaser";
import logoImg from "./assets/logo.png";
import skyImg from "./assets/sky.png";
import groundImg from "./assets/platform.png";
import starImg from "./assets/star.png";
import bombImg from "./assets/bomb.png";
import dudeImg from "./assets/dude.png";
import pessoasImg from "./assets/pessoas.png"


var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var player;
var playerMarcelo;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload() {
  this.load.image("logo", logoImg);
  this.load.image('sky', skyImg);
  this.load.image('ground', groundImg);
  this.load.image('star', starImg);
  this.load.image('bomb', bombImg);
  this.load.spritesheet('dude', dudeImg, { frameWidth: 32, frameHeight: 48 });
  this.load.spritesheet('pessoas', pessoasImg, { frameWidth: 48, frameHeight: 48 });

}

function create() {
  //  A simple background for our game
  this.add.image(400, 300, 'sky');

  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = this.physics.add.staticGroup();

  //  Here we create the ground.
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  //  Now let's create some ledges
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  // The player and its settings
  player = this.physics.add.sprite(100, 450, 'dude');
  playerMarcelo = this.physics.add.sprite(200, 450, 'pessoas');


  //  Player physics properties. Give the little guy a slight bounce.
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

   //  Player physics properties. Give the little guy a slight bounce.
   playerMarcelo.setBounce(0.2);
   playerMarcelo.setCollideWorldBounds(true);
  

  //  Our player animations, turning, walking left and walking right.
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [{ key: 'dude', frame: 4 }],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  //  Our player animations, turning, walking left and walking right.
  this.anims.create({
    key: 'leftMarcelo',
    frames: this.anims.generateFrameNumbers('pessoas', { start: 15, end: 17 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turnMarcelo',
    frames: [{ key: 'pessoas', frame: 4 }],
    frameRate: 20
  });

  this.anims.create({
    key: 'rightMarcelo',
    frames: this.anims.generateFrameNumbers('pessoas', { start: 27, end: 29 }),
    frameRate: 10,
    repeat: -1
  });


  //  Input Events
  cursors = this.input.keyboard.createCursorKeys();

  //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });

  stars.children.iterate(function (child) {

    //  Give each star a slightly different bounce
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

  });

  bombs = this.physics.add.group();
  

  //  The score
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

  //  Collide the player and the stars with the platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(playerMarcelo, player);
  this.physics.add.collider(playerMarcelo, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(bombs, bombs);

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.collider(player, bombs, hitBomb, null, this);
  this.physics.add.overlap(playerMarcelo, stars, collectStar, null, this);
  this.physics.add.collider(playerMarcelo, bombs, hitBomb, null, this);

}

function update() {
  if (gameOver) {
    return;
  }

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('left', true);

    playerMarcelo.setVelocityX(-160);
    playerMarcelo.anims.play('leftMarcelo', true);

  }
  else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('right', true);
    playerMarcelo.setVelocityX(160);
    playerMarcelo.anims.play('rightMarcelo', true);
  }
  

  else {
    player.setVelocityX(0);
    player.anims.play('turn');
    playerMarcelo.setVelocityX(0);
    playerMarcelo.anims.play('turnMarcelo');
  }


  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
    playerMarcelo.setVelocityY(-330);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  //  Add and update the score
  score += 10;
  scoreText.setText('Score: ' + score);

  if (stars.countActive(true) === 0) {
    //  A new batch of stars to collect
    stars.children.iterate(function (child) {

      child.enableBody(true, child.x, 0, true, true);

    });

    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;

  }
}

function hitBomb(player1, bomb) {
  this.physics.pause();

  player1.setTint(0xff0000);

  if (player1==player)
    player1.anims.play('turn');
  else player1.anims.play('turnMarcelo');

  gameOver = true;
}


/* const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("logo", logoImg);
}

function create() {
  const logo = this.add.image(400, 150, "logo");

  this.tweens.add({
    targets: logo,
    y: 450,
    duration: 2000,
    ease: "Power2",
    yoyo: true,
    loop: -1
  });
}
 */