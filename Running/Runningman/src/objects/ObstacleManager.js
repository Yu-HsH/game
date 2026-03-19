export default class ObstacleManager {

    constructor(scene){
        this.scene = scene;

        this.group = scene.physics.add.group();
        this.speed = 200;
    }

    update(){
        this.group.getChildren().forEach(o=>{
            if(o.x + o.displayWidth < 0){
                o.destroy();
            }
        });
    }

    // 🟢 LOW → 슬라이드 필수
    spawnLowObstacle(platform){

        let x = platform.x;
        let platformTop = platform.y - platform.displayHeight / 2;

        // 👉 플레이어 기본 높이(90)는 맞고
        // 👉 슬라이드(50)는 통과하도록
        //let y = platformTop - 25; // 낮게 깔림

        let o = this.group.create(x, 0, 'obstacle');
        o.setDisplaySize(60, 50);
        o.refreshBody();
        o.y=platformTop-35;
        o.setVelocityX(-this.speed);
        o.body.allowGravity = false;
    }

    // 🔴 HIGH → 점프 필수
    spawnHighObstacle(platform){

        let x = platform.x;
        let platformTop = platform.y - platform.displayHeight / 2;

        let o = this.group.create(x, 0, 'obstacle');

        o.setDisplaySize(60, 60);
        o.refreshBody();

            // 🔥 점프 안하면 무조건 맞음
        o.y = platformTop - 90;

        o.setVelocityX(-this.speed);
        o.body.allowGravity = false;
    }
}