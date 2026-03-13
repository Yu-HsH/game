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
    scene: { preload, create, update }
};

let game = new Phaser.Game(config);

let player;
let cursors;

let ground;
let obstacles;
let platforms=[];

let score=0;
let scoreTxt;

let isSliding=false;
let isGameOver=false;

let jumpCount=0;
let maxJump=2;

const SPEED=200;

const LEVELS={
    LOW:520,
    MID:420,
    HIGH:320
};

let levelOrder=[LEVELS.LOW,LEVELS.MID,LEVELS.HIGH];
let currentLevel=LEVELS.LOW;

function preload(){

    this.load.image('ground','https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('obstacle','https://labs.phaser.io/assets/sprites/block.png');
    this.load.image('sky','./assets/sky.png');

     // RUN
    this.load.image('running1','assets/running/running1.png');
    this.load.image('running2','assets/running/running2.png');
    this.load.image('running3','assets/running/running3.png');

    // SLIDE
    this.load.image('slide1','assets/slide/slide1.png');
    this.load.image('slide2','assets/slide/slide2.png');
    this.load.image('slide3','assets/slide/slide3.png');

    // JUMP
    this.load.image('jump','assets/jump/jump1.png');

    // DOUBLE JUMP
    this.load.image('doublejump1','assets/jump/doublejump1.png');
    this.load.image('doublejump2','assets/jump/doublejump2.png');
    this.load.image('doublejump3','assets/jump/doublejump3.png');
    this.load.image('doublejump4','assets/jump/doublejump4.png');
    this.load.image('doublejump5','assets/jump/doublejump5.png');
}

function create(){

    this.add.image(400,300,'sky').setDisplaySize(800,600);

    ground=this.physics.add.group({allowGravity:false,immovable:true});
    obstacles=this.physics.add.group();

    player=this.physics.add.sprite(200,400,'running1');

    // RUN 애니메이션
    this.anims.create({
        key:'run',
        frames:[
            {key:'running1'},
            {key:'running2'},
            {key:'running3'}
        ],
        frameRate:10,
        repeat:-1
        });

// SLIDE 애니메이션
    this.anims.create({
        key:'slide',
        frames:[
            {key:'slide2'},
            {key:'slide3'},
            {key:'slide2'},
            {key:'slide3'}
        ],
        frameRate:12,
        repeat:-1
    });

// JUMP
    this.anims.create({
        key:'jump',
        frames:[
            {key:'jump'}
        ],
        frameRate:1,
        repeat:0
    });

// DOUBLE JUMP
    this.anims.create({
        key:'doublejump',
        frames:[
            {key:'doublejump1'},
            {key:'doublejump2'},
            {key:'doublejump3'},
            {key:'doublejump4'},
            {key:'doublejump5'}
        ],
        frameRate:12,
        repeat:0
    }); 
    //player.setScale(0.3);
    player.originalHeight=player.body.height;
    player.originalOffset=player.body.offset.y;

    this.physics.add.collider(player,ground);
    this.physics.add.collider(player,obstacles,gameOver,null,this);

    cursors=this.input.keyboard.createCursorKeys();

    scoreTxt=this.add.text(20,20,'Score:0',{fontSize:'24px',fill:'#fff'});

    // 시작 플랫폼
    let startPlatform=createPlatform.call(this,0,LEVELS.LOW,600);
    platforms.push(startPlatform);

    this.time.addEvent({
        delay:1200,
        callback:spawnPlatform,
        callbackScope:this,
        loop:true
    });
}

function playAnim(player, anim){

    if(
        !player.anims.currentAnim ||
        player.anims.currentAnim.key !== anim
    ){
        player.play(anim,true);
    }

}

function update(time,delta){

    if(isGameOver) return;

    if(
        Phaser.Input.Keyboard.JustDown(cursors.space)
        && jumpCount<maxJump
    ){
        player.setVelocityY(-500);
        jumpCount++;
    }

    if(player.body.touching.down) jumpCount=0;

    // 슬라이딩
    if(cursors.down.isDown && !isSliding){

        isSliding=true;

        let newHeight=player.originalHeight/2;

        player.body.setSize(player.body.width,newHeight);

        player.body.setOffset(
            player.body.offset.x,
            player.originalOffset+newHeight
        );
    }
    else if(cursors.down.isUp && isSliding){

        isSliding=false;

        player.body.setSize(player.body.width,player.originalHeight);

        player.body.setOffset(player.body.offset.x,player.originalOffset);
    }

    // 플랫폼 삭제
    ground.getChildren().forEach(p=>{

        if(!p.active) return;

        if(p.x+p.displayWidth<0){
            p.destroy();
            platforms=platforms.filter(pl=>pl!==p);
        }
    });

    // 장애물 삭제
    obstacles.getChildren().forEach(o=>{

        if(!o.active) return;

        if(o.x+o.width<0) o.destroy();
    });

    score+=delta/1000;
    scoreTxt.setText("Score:"+Math.floor(score));

    if(player.y>600) gameOver.call(this);

    // 슬라이딩
    if(isSliding){playAnim(player,'slide');}

    // 점프
    else if(jumpCount === 1){playAnim(player,'jump');}

// 더블 점프
    else if(jumpCount === 2){ playAnim(player,'doublejump');}

// 기본 RUN
    else if(player.body.touching.down){playAnim(player,'run');}
}

function spawnPlatform(){

    let lastPlatform=platforms[platforms.length-1];

    let lastX=lastPlatform.x;
    let lastWidth=lastPlatform.displayWidth;

    let distance=Phaser.Math.Between(250,350);

    let spawnX=lastX+lastWidth/2+distance;

    let newLevel=nextLevel();

    let width=Phaser.Math.Between(450,650);

    let platform=createPlatform.call(this,spawnX,newLevel,width);

    platforms.push(platform);

    spawnObstacleOnPlatform.call(this,platform);

}

function createPlatform(x,y,width){

    let platform=ground.create(x,y,'ground');

    platform.setDisplaySize(width,40).refreshBody();

    platform.setVelocityX(-SPEED);

    return platform;
}

function spawnObstacleOnPlatform(platform){

    let width=platform.displayWidth;

    // 플랫폼 시작 보호 구간
    let minX=platform.x-width/2+150;
    let maxX=platform.x+width/2-100;

    if(maxX<=minX) return;

    let obstacleX=Phaser.Math.Between(minX,maxX);

    let platformTop=platform.y-platform.displayHeight/2;

    let obstacle=obstacles.create(
        obstacleX,
        platformTop-20,
        'obstacle'
    );

    obstacle.setVelocityX(-SPEED);

    obstacle.body.allowGravity=false;

    obstacle.setScale(0.6);

}

function nextLevel(){

    if(currentLevel===LEVELS.LOW){

        currentLevel=LEVELS.MID;

    }
    else if(currentLevel===LEVELS.MID){

        currentLevel=Phaser.Math.Between(0,1)
        ?LEVELS.LOW
        :LEVELS.HIGH;

    }
    else if(currentLevel===LEVELS.HIGH){

        currentLevel=LEVELS.MID;

    }

    return currentLevel;
}

function gameOver(){

    if(isGameOver) return;

    isGameOver=true;

    this.physics.pause();

    this.add.text(300,250,'GAME OVER',{fontSize:'50px',fill:'#fff'});
}