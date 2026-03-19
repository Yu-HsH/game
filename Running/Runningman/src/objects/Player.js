export default class Player {

    constructor(scene){

        this.scene = scene;

        this.sprite = scene.physics.add.sprite(200,400,'running2');
        
        this.normalSize = { w: 120, h: 120 };
        this.slideSize = { w: 120, h: 80 };

        this.normalOffset = { x: 0, y: 0 };
        this.slideOffset = { x: 0, y: 0 };

        this.sprite.setOrigin(0.5,1);
        this.sprite.setScale(0.5)
        this.sprite.body.setSize(this.normalSize.w, this.normalSize.h);
        this.sprite.body.setOffset(this.normalOffset.x, this.normalOffset.y);
        
        // 상태
        this.isSliding = false;
        this.isDoubleJump = false;

        this.jumpCount = 0;
        this.maxJump = 2;

        this.cursors = scene.input.keyboard.createCursorKeys();

        this.createAnimations();
            
        this.hasPlayedDoubleJump = false;
    }

    createAnimations(){

        const s = this.scene;

        s.anims.create({
            key:'run',
            frames:[{key:'running2'},{key:'running3'}],
            frameRate:10,
            repeat:-1
        });

        s.anims.create({
            key:'slide',
            frames:[{key:'slide2'},{key:'slide3'}],
            frameRate:12,
            repeat:-1
        });

        s.anims.create({
            key:'jump',
            frames:[{key:'jump'}]
        });

        s.anims.create({
            key:'doublejump',
            frames:[
                {key:'doublejump2'},
                {key:'doublejump3'},
                {key:'doublejump4'},
                {key:'doublejump5'},
                {key:'doublejump1'}
            ],
            frameRate:12
        });
    }

    update(){

        const body = this.sprite.body;

        // 점프 로직 수정 (슬라이드 중 점프)
        if(Phaser.Input.Keyboard.JustDown(this.cursors.space)
            && this.jumpCount < this.maxJump){

            // ✅ 슬라이드 해제 + 히트박스 복구
            if(this.isSliding){
                this.isSliding = false;

                this.sprite.body.setSize(this.normalSize.w, this.normalSize.h);
                this.sprite.body.setOffset(this.normalOffset.x, this.normalOffset.y);
            }

            this.sprite.setVelocityY(-500);
            this.jumpCount++;
                // ✅ jumpCount 기반 double jump
            if(this.jumpCount === 2){
                this.isDoubleJump = true;
                this.hasPlayedDoubleJump = false;
            }
        }

        // 착지
        if(body.blocked.down && body.velocity.y >= 0){
            this.jumpCount = 0;
            this.isDoubleJump = false;
            this.hasPlayedDoubleJump = false;
        }

        // 슬라이드 로직 수정
        if(this.cursors.down.isDown && !this.isSliding && body.blocked.down){

            this.isSliding = true;

            this.sprite.body.setSize(this.slideSize.w, this.slideSize.h);
            this.sprite.body.setOffset(this.slideOffset.x, this.slideOffset.y);
        }
        else if(this.cursors.down.isUp && this.isSliding){

            this.isSliding = false;

            this.sprite.body.setSize(this.normalSize.w, this.normalSize.h);
            this.sprite.body.setOffset(this.normalOffset.x, this.normalOffset.y);
        }

        // 애니메이션 우선순위
        if(this.isSliding){
            this.play('slide');
        }
        else if(this.isDoubleJump){
            this.play('doublejump');
        }
        else if(!body.blocked.down){
            this.play('jump');
        }
        else{
            this.play('run');
        }
    }

    play(key){
        if(!this.sprite.anims.currentAnim || this.sprite.anims.currentAnim.key !== key){
            this.sprite.play(key,true);
        }
    }
}