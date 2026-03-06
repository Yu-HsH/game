let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

let game = new Phaser.Game(config);

let player;
let cursors;

let ground;
let obstacles;

let platforms = [];

let background;

let score = 0;
let scoreTxt;

let isGameOver = false;
let isSliding = false;

let jumpCount = 0;
let maxJump = 1;

const PLATFORM_LEVELS = {
    LOW: 520,
    MID: 420,
    HIGH: 320
};

function preload(){

    this.load.image('player','./assets/cookie.png');
    this.load.image('ground','https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('obstacle','https://labs.phaser.io/assets/sprites/block.png');
    this.load.image('sky','./assets/sky.png');

}

function create(){

    background = this.add.image(400,300,'sky');
    background.setDisplaySize(800,600);

    ground = this.physics.add.group({
        allowGravity:false,
        immovable:true
    });

    obstacles = this.physics.add.group();

    player = this.physics.add.sprite(200,400,'player');

    player.originalHeight = player.body.height;
    player.originalOffset = player.body.offset.y;

    this.physics.add.collider(player,ground);
    this.physics.add.collider(player,obstacles,gameOver,null,this);

    cursors = this.input.keyboard.createCursorKeys();

    scoreTxt = this.add.text(20,20,'Score:0',{
        fontSize:'24px',
        fill:'#ffffff'
    });

    // ⭐ 시작 플랫폼 (플레이어 아래)
    let startPlatform = ground.create(300,520,'ground');
    startPlatform.setDisplaySize(400,40).refreshBody();
    startPlatform.setVelocityX(-200);

    platforms.push(startPlatform);
    // ⭐ 시작 플랫폼
    for(let i=0;i<2;i++){
        spawnPlatform.call(this);
    }

    this.time.addEvent({
        delay:1000,
        callback:spawnPlatform,
        callbackScope:this,
        loop:true
    });

    this.time.addEvent({
        delay:1500,
        callback:spawnObstacle,
        callbackScope:this,
        loop:true
    });

}

function update(time,delta){

    if(isGameOver) return;

    // 점프
    if(
        Phaser.Input.Keyboard.JustDown(cursors.space) &&
        jumpCount < maxJump
    ){
        player.setVelocityY(-500);
        jumpCount++;
    }

    if(player.body.touching.down){
        jumpCount = 0;
    }

    // 슬라이딩
    if(cursors.down.isDown && !isSliding){

        isSliding = true;

        let newHeight = player.originalHeight / 2;

        player.body.setSize(player.body.width,newHeight);

        player.body.setOffset(
            player.body.offset.x,
            player.originalOffset + newHeight
        );

    }

    else if(cursors.down.isUp && isSliding){

        isSliding = false;

        player.body.setSize(
            player.body.width,
            player.originalHeight
        );

        player.body.setOffset(
            player.body.offset.x,
            player.originalOffset
        );
    }

    // 점수
    score += delta/1000;
    scoreTxt.setText('Score: '+Math.floor(score));

    // 장애물 삭제
    obstacles.getChildren().forEach(function(o){

        if(!o || !o.active) return;

        if(o.x + o.width < 0){
            o.destroy();
        }

    });

    // 플랫폼 삭제
    ground.getChildren().forEach(function(p){

        if(!p || !p.active) return;

        if(p.x + p.displayWidth < 0){

            p.destroy();

            platforms = platforms.filter(pl => pl !== p);

        }

    });

    // 게임 오버
    if(player.y > 600){
        gameOver.call(this);
    }

}

function spawnPlatform(){

    let levels = [
        PLATFORM_LEVELS.LOW,
        PLATFORM_LEVELS.MID,
        PLATFORM_LEVELS.HIGH
    ];

    let newY = Phaser.Utils.Array.GetRandom(levels);

    let lastX = this.scale.width;

    if(platforms.length > 0){
        lastX = platforms[platforms.length-1].x;
    }

    let spawnX = lastX + Phaser.Math.Between(300,500);

    let platform = ground.create(
        spawnX,
        newY,
        'ground'
    );

    platform.setDisplaySize(200,40).refreshBody();

    platform.body.allowGravity = false;

    platform.setVelocityX(-200);

    platforms.push(platform);

}

function spawnObstacle(){

    if(platforms.length === 0) return;

    let p = Phaser.Utils.Array.GetRandom(platforms);

    if(!p || !p.active) return;

    let platformTop = p.y - p.displayHeight/2;

    let spawnX = this.scale.width + Phaser.Math.Between(100,200);

    let spawnY = platformTop - 20;

    let obstacle = obstacles.create(
        spawnX,
        spawnY,
        'obstacle'
    );

    obstacle.setVelocityX(-200);

    obstacle.body.allowGravity=false;

}

function gameOver(){

    if(isGameOver) return;

    isGameOver = true;

    this.physics.pause();

    this.add.text(300,250,'GAME OVER',{
        fontSize:'50px',
        fill:'#ffffff'
    });

}