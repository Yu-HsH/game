export default class ObstacleManager {

    constructor(scene){

        this.scene = scene;

        this.group = scene.physics.add.group();

        this.speed = 200;
    }

    update(platformManager){

        this.group.getChildren().forEach(o=>{
            if(o.x + o.width < 0){
                o.destroy();
            }
        });

        // 플랫폼 기준 생성
        let platforms = platformManager.platforms;

        if(platforms.length === 0) return;

        let last = platforms[platforms.length-1];

        if(!last.spawned){

            this.spawnOnPlatform(last);
            last.spawned = true;
        }
    }

    spawnOnPlatform(platform){

        let width = platform.displayWidth;

        let min = platform.x - width/2 + 100;
        let max = platform.x + width/2 - 100;

        let x = Phaser.Math.Between(min,max);

        let y = platform.y - 40;

        let o = this.group.create(x,y,'obstacle');

        o.setVelocityX(-this.speed);
        o.body.allowGravity = false;
    }
}