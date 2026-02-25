let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 300,
     scale: {
        // 모드 설정 (가장 중요)
        mode: Phaser.Scale.FIT, // FIT, ENVELOP, RESIZE, NONE
        autoCenter: Phaser.Scale.CENTER_BOTH, // 화면 중앙 정렬
        width: 800,
        height: 600,
        min: {
            width: 400,
            height: 300
        },
        max: {
            width: 1600,
            height: 1200
        }
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

let player;
let cursors;

function preload() {    //게임 시작 전, 필요한 자원(이미지, 스프라이트시트, 사운드,폰트,맵 등)을 미리 불러오는 역할
    this.load.image('player', './assets/cookie.png');
    this.load.image('ground','https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('obstacle', 'https://labs.phaser.io/assets/sprites/block.png');
    this.load.image('sky','./assets/sky.png');

}
let ground;
let obstacles;
let background;
function create() { //preload를 통해 로드된 자원을 이용해서 실제 게임화면을 만드는 역할
    background=this.add.image(400,300, 'sky');
    
    //바닥 생성(static)->바닥은 움직이면 안되므로 static
    ground=this.physics.add.staticImage(400,400,'ground');
    ground.setDisplaySize(800, 40).refreshBody();
    
    
    
    //플레이어 생성
    player = this.physics.add.sprite(100, 0, 'player');
    //player.setCollideWorldBounds(true);

    // 플레이어와 바닥 충돌 설정
    this.physics.add.collider(player,ground);
    
    obstacles=this.physics.add.group();
    
    this.time.addEvent({
        delay:1500,
        callback: spawnObstacle,
        callbackScope:this,
        loop:true
    });

    this.physics.add.collider(player, obstacles, gameOver, null, this);
    
    cursors = this.input.keyboard.createCursorKeys();
}

let jumpCount = 0;
let maxJump = 1;
  
function update() { //게임이 실행되는 동안 계속 반복되는 루프, 이동,충돌체크,키보드입력에 따른 반응 역할
    // 점프 입력
    if (
        Phaser.Input.Keyboard.JustDown(cursors.space) &&
        jumpCount < maxJump
    ) {
        player.setVelocityY(-400,50);
        jumpCount++;
    }

    // 착지하면 점프 횟수 초기화
    if (player.body.touching.down) {
        jumpCount = 0;
    }

    obstacles.children.iterate(function(obstacle){
        if(obstacle&&obstacle.x<-50){
            obstacle.destroy();
        }
    });
}
function spawnObstacle(){
    let obstacle= obstacles.create(800,340,'obstacle');
    obstacle.setVelocityX(-300);
    obstacle.body.allowGravity=false;
    obstacle.setImmovable(true);
    
}
function gameOver(){
    console.log("Game Over");
    this.physics.pause();
}