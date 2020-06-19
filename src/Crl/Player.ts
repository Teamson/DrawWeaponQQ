import Utility from "../Mod/Utility"
import GameLogic from "./GameLogic"
import PlayerDataMgr from "../Libs/PlayerDataMgr"
import Boss from "./Boss"
import WxApi from "../Libs/WxApi"
import GameUI from "../View/GameUI"
import SoundMgr from "../Mod/SoundMgr"

export default class Player extends Laya.Script {
    constructor() {
        super()
    }
    myOwner: Laya.Sprite3D = null
    _ani: Laya.Animator = null
    weaponNode: Laya.Sprite3D = null
    enemyNode: Laya.Sprite3D = null
    embNode: Laya.Sprite3D = null

    closeNode: Laya.Sprite3D = null

    isPlayer: boolean = true
    isHited: boolean = false
    haveWeapon: boolean = false
    isDied: boolean = false
    fightStarted: boolean = false

    weaponLength: number = 5
    walkSpeed: number = 0.08
    myId: number = 0
    backDistance: number = 8
    weaponSpeed: number = 1
    hpMax: number = 100
    hp: number = 100
    atk: number = 20

    embScale = null
    embPos = null
    embRotation = null

    isBossState: boolean = false

    onAwake() {
        this.myOwner = this.owner as Laya.Sprite3D

        this._ani = this.owner.getComponent(Laya.Animator)
        this.playIdle1()

        this.weaponNode = Utility.findNodeByName(this.myOwner, 'Dummy_Arms')
        this.embNode = Utility.findNodeByName(this.myOwner, 'Dummy_Emb')
        let emb = Utility.findNodeByName(this.myOwner, 'Hero1_Emb')
        this.embScale = emb.transform.localScale.clone()
        this.embPos = emb.transform.localPosition.clone()
        this.embRotation = emb.transform.localRotation.clone()
    }

    initData(id: number, isPlayer: boolean) {
        this.myId = id
        this.isPlayer = isPlayer
        if (!this.isPlayer) {
            this.playIdle2()
        }

        if (isPlayer) {
            this.changeSkin(PlayerDataMgr.freeSkinId != -1 ? PlayerDataMgr.freeSkinId : PlayerDataMgr.getPlayerData().playerId)
            this.hp = PlayerDataMgr.getPlayerPowerData().hp
            this.hpMax = this.hp
            this.atk = PlayerDataMgr.getPlayerPowerData().atk
        }
    }

    playIdle1() {
        this._ani.speed = 1
        this._ani.crossFade("idle1", 0.05);
    }
    playIdle2() {
        this._ani.speed = 1
        this._ani.crossFade("idle2", 0.05);
    }

    playWalk() {
        //this._ani.speed = this.getPlayerAniSpeed()
        this._ani.play("walk", 0, 0);
        this._ani.crossFade("hit", 0.05, 1);
        let crl = this._ani.getControllerLayer(1) as Laya.AnimatorControllerLayer
        crl.getAnimatorState('hit').speed = this.getPlayerAniSpeed()
    }

    playDied() {
        //this._ani.speed = 1
        this._ani.crossFade("died", 0.05);
        let crl = this._ani.getControllerLayer(1) as Laya.AnimatorControllerLayer
        crl.getAnimatorState('hit').speed = 0
    }

    //获取武器挥动速度
    getPlayerAniSpeed() {
        let wLength: number = this.weaponLength
        if (wLength > 50) {
            return this.weaponSpeed - this.weaponSpeed * (wLength - 50) * 0.01
        } else {
            return this.weaponSpeed
        }
    }
    //获取被击退距离
    getHitbackDistance() {
        let wLength: number = this.weaponLength
        if (wLength > 50) {
            return this.backDistance - this.backDistance * (wLength - 50) * 0.01
        } else {
            return this.backDistance
        }
    }

    //添加武器
    addWeapon(weapon: Laya.Sprite3D) {
        this.weaponNode.addChild(weapon)
        this.weaponLength = this.weaponNode.getChildAt(0).numChildren > 100 ? 100 : this.weaponNode.getChildAt(0).numChildren
        weapon.transform.localPosition = new Laya.Vector3(0, 0, 0)
        this.haveWeapon = true
        if (this.weaponNode.numChildren > 30) {
            this.atk = this.atk * (1 + (this.weaponNode.numChildren - 30) * 0.005)
        }
        if (this.isPlayer) {
            SoundMgr.instance.playSoundEffect('weaponReady.mp3')
        }
        this.playIdle2()
    }
    //移除武器
    removeWeapon() {
        this.weaponNode.destroyChildren()
    }

    goToFight(enemyNode: Laya.Sprite3D) {
        if (this.isPlayer) {
            if (this.hp == this.hpMax) {
                this.hp = PlayerDataMgr.getPlayerPowerData().hp
                this.hpMax = this.hp
            }
            this.atk = PlayerDataMgr.getPlayerPowerData().atk
        } else {
            if (this.hp == this.hpMax) {
                this.hp = PlayerDataMgr.getNpcData().hp
                this.hpMax = this.hp
            }
            this.atk = PlayerDataMgr.getNpcData().atk
        }
        this.fightStarted = true
        this.enemyNode = enemyNode
        this.isBossState = PlayerDataMgr.getPlayerData().gradeIndex >= 3
        this.playWalk()
    }

    onUpdate() {
        if (this.enemyNode && this.enemyNode.numChildren > 0 && !this.isHited && !this.isDied && this.fightStarted && !GameLogic.Share.pauseGame) {
            let myPos = this.myOwner.transform.position.clone()
            let disMin: number = 99999
            let closeNode: Laya.Sprite3D = null
            for (let i = 0; i < this.enemyNode.numChildren; i++) {
                let eNode = this.enemyNode.getChildAt(i) as Laya.Sprite3D
                if (!eNode || !eNode.transform) continue
                let crl = eNode.getComponent(Player) as Player
                if (crl && crl.isDied) continue
                let dis = Laya.Vector3.distance(myPos, eNode.transform.position.clone())
                if (dis < disMin) {
                    disMin = dis
                    closeNode = eNode
                }
            }

            if (this.closeNode && this.closeNode.transform && this.closeNode.getComponent(Player) && !(this.closeNode.getComponent(Player).isDied)) {
                closeNode = this.closeNode
            } else {
                this.closeNode = null
                this.closeNode = closeNode
            }

            if (!closeNode) return

            this.myOwner.transform.lookAt(closeNode.transform.position, new Laya.Vector3(0, 1, 0))
            this.myOwner.transform.rotate(new Laya.Vector3(0, 180, 0), true, false)
            let dir = Utility.getDirectionAToB(this.myOwner, closeNode)
            dir = new Laya.Vector3(dir.x * this.walkSpeed, dir.y * this.walkSpeed, dir.z * this.walkSpeed)
            let desPos = new Laya.Vector3(0, 0, 0)
            Laya.Vector3.add(myPos, dir, desPos)
            if (this.isBossState && disMin < 6) {
                return
            } else if (!this.isBossState && disMin < 0.5) {
                return
            }

            this.myOwner.transform.position = desPos
        }
    }

    onLateUpdate() {
        if (this.weaponNode && this.enemyNode && this.enemyNode.numChildren > 0 && !this.isHited && !this.isDied && this.fightStarted && !GameLogic.Share.pauseGame) {
            this.checkIsHitEnemy()
        }
    }

    //检测武器是否击中敌人
    checkIsHitEnemy() {
        let lineNode = this.weaponNode.getChildAt(0) as Laya.Sprite3D
        if (!lineNode || lineNode == null || lineNode == undefined || this.isDied) {
            return
        }
        for (let i = 0; i < lineNode.numChildren; i++) {
            let w = lineNode.getChildAt(i) as Laya.Sprite3D
            let wPos = w.transform.position.clone()
            wPos.y = 0

            for (let j = 0; j < this.enemyNode.numChildren; j++) {
                let e = this.enemyNode.getChildAt(j) as Laya.Sprite3D
                let ePos = e.transform.position.clone()
                ePos.y = 0
                let dis = Laya.Vector3.distance(wPos, ePos)
                if (!this.isBossState && dis <= 1) {
                    let pCrl = e.getComponent(Player) as Player
                    pCrl.hitBack(w, this.atk, this.myOwner)
                    return
                } else if (this.isBossState && dis <= 5) {
                    let pCrl = e.getComponent(Boss) as Boss
                    pCrl.hitBack(this.atk)
                    return
                }
            }
        }
    }

    //被击退
    hitBack(node: Laya.Sprite3D, atk: number, from?: Laya.Sprite3D) {
        if (this.isDied || this.isHited) {
            return
        }
        if (!this.isPlayer) {
            WxApi.DoVibrate()
        }

        let id = Utility.GetRandom(1, 4)
        SoundMgr.instance.playSoundEffect('weaponHit' + id + '.mp3')

        this.createHitFX()

        this.hp -= atk
        if (this.hp <= 0) {
            if (!this.isPlayer) {
                GameUI.Share.createCry(this.myOwner)
                GameUI.Share.createCoinBoom(this.myOwner)
                PlayerDataMgr.changeCoin(10)
                SoundMgr.instance.playSoundEffect('getCoin.mp3')
            } else {
                GameUI.Share.createSmile(from)
            }

            let id = Utility.GetRandom(1, 2)
            SoundMgr.instance.playSoundEffect('die' + id + '.mp3')
            this.isDied = true
            this.playDied()
            Laya.timer.once(1000, this, () => {
                this.owner.destroy()
            })
            return
        }

        this.isHited = true
        let pA: Laya.Vector3 = node.transform.position.clone()
        let pB: Laya.Vector3 = this.myOwner.transform.position.clone()

        let dir = new Laya.Vector3(0, 0, 0)
        Laya.Vector3.subtract(pB, pA, dir)
        Laya.Vector3.normalize(dir, dir)
        dir = new Laya.Vector3(dir.x * this.getHitbackDistance(), 0, dir.z * this.getHitbackDistance())

        let myPos = this.myOwner.transform.position.clone()
        Laya.Vector3.add(myPos, dir, myPos)

        Utility.TmoveTo(this.myOwner, 200, myPos, () => { this.isHited = false })
    }

    createHitFX() {
        let hit = Laya.loader.getRes(WxApi.UnityPath + 'hitFX.lh') as Laya.Sprite3D
        let fx: Laya.Sprite3D = Laya.Sprite3D.instantiate(hit, this.myOwner, true, new Laya.Vector3(0, 2, 0));
        fx.transform.localPosition = new Laya.Vector3(0, 1.5, 0)
        Laya.timer.once(1000, GameLogic.Share, () => {
            fx.destroy()
        })
    }

    //切换皮肤
    changeSkin(id: number) {
        let mats = new Laya.UnlitMaterial();
        Laya.Texture2D.load('res/skinHero/HeroD_' + (id + 1) + '.png', Laya.Handler.create(this, function (tex) {
            mats.albedoTexture = tex;
        }))
        for (let i = 1; i <= 4; i++) {
            let mesh3d = this.owner.getChildAt(i) as Laya.SkinnedMeshSprite3D;
            mesh3d.skinnedMeshRenderer.material = mats;
        }

        this.embNode.destroyChildren()
        let embRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero' + (id + 1) + '_Emb.lh') as Laya.Sprite3D
        let emb: Laya.Sprite3D = Laya.Sprite3D.instantiate(embRes, this.embNode, false, new Laya.Vector3(0, 0, 0));
        emb.transform.localScale = this.embScale
        emb.transform.localPosition = this.embPos
        emb.transform.localRotation = this.embRotation
    }

}