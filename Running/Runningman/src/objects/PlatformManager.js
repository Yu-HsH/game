export default class PlatformManager {

    constructor(scene){

        this.scene = scene;

        this.group = scene.physics.add.group({
            allowGravity:false,
            immovable:true
        });

        this.platforms = [];

        this.speed = 200;

        this.createInitial();
    }

    createInitial(){

        let p = this.createPlatform(400,520,1400);
        this.platforms.push(p);
    }

    update(){

        let last = this.platforms[this.platforms.length-1];

        if(last.x + last.displayWidth/2 < 800){
            this.spawnPlatform();
        }

        this.group.getChildren().forEach(p=>{
            if(p.x + p.displayWidth < 0){
                p.destroy();
                this.platforms = this.platforms.filter(pl=>pl!==p);
            }
        });
    }

    spawnPlatform(){

        let last = this.platforms[this.platforms.length-1];

        let x = last.x + last.displayWidth/2 + Phaser.Math.Between(250,350);
        let width = Phaser.Math.Between(450,650);

        let p = this.createPlatform(x,520,width);
        this.platforms.push(p);
    }

    createPlatform(x,y,width){

        let p = this.group.create(x,y,'ground');

        p.setDisplaySize(width,40).refreshBody();
        p.setVelocityX(-this.speed);

        return p;
    }
}