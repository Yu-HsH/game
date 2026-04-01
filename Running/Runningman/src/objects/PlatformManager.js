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

        // ✅ 패턴 중복 생성 방지용
        this.isSpawning = false;

        this.patterns = [

            // 🟢 기본 러닝
            [
                { dx: 200, dy: 0, width: 400 },
                { dx: 200, dy: 0, width: 400 }
            ],

            // 🔼 계단형
            [
                { dx: 220, dy: -100, width: 300 },
                { dx: 220, dy: -100, width: 300 },
                { dx: 220, dy: 100, width: 300 }
            ],

            // 🟡 슬라이드 장애물
            [
                { dx: 200, dy: 0, width: 500, obstacle: 'low' },
                { dx: 200, dy: 0, width: 400 }
            ],

            // 🔴 점프 장애물
            [
                { dx: 250, dy: 0, width: 400, obstacle: 'high' },
                { dx: 200, dy: 0, width: 400 }
            ],

            // 🔥 혼합
            [
                { dx: 220, dy: -100, width: 300, obstacle: 'high' },
                { dx: 220, dy: 100, width: 300, obstacle: 'low' },
                { dx: 200, dy: 0, width: 400 }
            ]
        ];
    }

    createInitial(){
        let p = this.createPlatform(400,520,1400);
        this.platforms.push(p);
    }

    update(){

        // 1️⃣ 제거 + 배열 동기화
        this.platforms = this.platforms.filter(p=>{
            if(p.x + p.displayWidth < 0){
                p.destroy();
                return false;
            }
            return true;
        });

        if(this.platforms.length===0) return;

        let last = this.platforms[this.platforms.length - 1];

        this.platforms.forEach(p=>{
            if(p.isLastInPattern&&p.x<600){
                this.isSpawning=false;
                p.isLastInPattern=false;
            }
        });

        // 2️⃣ 패턴 생성 트리거 (중복 방지 포함)
        if(last.x < 600 && !this.isSpawning){
            this.isSpawning = true;
            this.spawnPattern();
        }
    }

    spawnPattern(){

        let pattern = Phaser.Math.RND.pick(this.patterns);

        let last = this.platforms[this.platforms.length - 1];
        if(!last) return;

        let baseX = last.x + last.displayWidth / 2;
        let baseY = last.y;

        pattern.forEach((step, index) => {

            let x = baseX + step.dx;
            let y = baseY + step.dy;

            let p = this.createPlatform(x, y, step.width);
            this.platforms.push(p);

            // ✅ 장애물 생성 (패턴 기반)
            if(step.obstacle){
                this.spawnObstacleByType(p, step.obstacle);
            }

            // 기준 갱신
            baseX = x + step.width / 2;
            baseY = y;

            // ✅ 마지막 플랫폼에서 spawn unlock
            if(index === pattern.length - 1){
                p.isLastInPattern = true;
            }
        });
    }

    spawnObstacleByType(platform, type){

        if(type === 'low'){
            this.scene.obstacleManager.spawnLowObstacle(platform);
        }
        else if(type === 'high'){
            this.scene.obstacleManager.spawnHighObstacle(platform);
        }
    }

    createPlatform(x,y,width){

        let p = this.group.create(x,y,'ground');

        p.setDisplaySize(width,40).refreshBody();
        p.setVelocityX(-this.speed);

        return p;
    }
}