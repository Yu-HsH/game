import Player from '../objects/Player.js';
import PlatformManager from '../objects/PlatformManager.js';
import ObstacleManager from '../objects/ObstacleManager.js';

export default class GameScene extends Phaser.Scene {

    constructor(){
        super('GameScene');
    }

    preload(){
        
        this.load.image('sky','./assets/sky.png');
        this.load.image('ground','https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('obstacle','https://labs.phaser.io/assets/sprites/block.png');

        this.load.image('running2','assets/running/running2.png');
        this.load.image('running3','assets/running/running3.png');

        this.load.image('slide2','assets/slide/slide2.png');
        this.load.image('slide3','assets/slide/slide3.png');

        this.load.image('jump','assets/jump/jump1.png');

        this.load.image('doublejump1','assets/jump/doublejump1.png');
        this.load.image('doublejump2','assets/jump/doublejump2.png');
        this.load.image('doublejump3','assets/jump/doublejump3.png');
        this.load.image('doublejump4','assets/jump/doublejump4.png');
        this.load.image('doublejump5','assets/jump/doublejump5.png');
    }

    create(){
        this.add.image(400,300,'sky').setDisplaySize(800,600);
        // ✅ 객체 생성 (전역 금지 → Scene이 소유)
        this.platformManager = new PlatformManager(this);
        this.obstacleManager = new ObstacleManager(this);
        this.player = new Player(this);

        // 충돌 연결
        this.physics.add.collider(
            this.player.sprite,
            this.platformManager.group
        );

        this.physics.add.collider(
            this.player.sprite,
            this.obstacleManager.group,
            this.gameOver,
            null,
            this
        );
        this.score = 0;

        this.scoreText = this.add.text(20,20,'Score:0',{
            fontSize:'24px',
            fill:'#fff'
        });
    }

    update(time, delta){

        this.player.update();
        this.platformManager.update();
        this.obstacleManager.update(this.platformManager);
         // ✅ 점수 증가
        this.score += delta / 1000;
        this.scoreText.setText('Score:' + Math.floor(this.score));
    }

    gameOver(){

        this.physics.pause();
        this.add.text(300,250,'GAME OVER',{fontSize:'40px'});
    }
}