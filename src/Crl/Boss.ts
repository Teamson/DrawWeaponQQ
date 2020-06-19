import Utility from "../Mod/Utility"
import WxApi from "../Libs/WxApi"
import SoundMgr from "../Mod/SoundMgr"

export default class Boss extends Laya.Script {
    constructor() {
        super()
    }

    myOwner: Laya.Sprite3D = null
    _ani: Laya.Animator = null
    isHited: boolean = false
    isDied: boolean = false

    hp: number = 100

    onAwake() {
        this.myOwner = this.owner as Laya.Sprite3D
        this._ani = this.owner.getComponent(Laya.Animator)
    }

    onDisable() {

    }

    playDied() {
        this._ani.speed = 1
        this._ani.crossFade("Take 001", 0.05);
    }

    //被击退
    hitBack(atk: number) {
        if (this.isDied || this.isHited) {
            return
        }

        let id = Utility.GetRandom(1, 3)
        SoundMgr.instance.playSoundEffect('castleHit' + id + '.mp3')
        WxApi.DoVibrate()
        Utility.objectShake(this.myOwner, 0.2, 0.1)
        this.hp -= atk
        if (this.hp <= 0) {
            this.isDied = true
            this.playDied()
            Laya.timer.once(1000, this, () => {
                this.owner.destroy()
            })
            return
        }

        this.isHited = true
        Laya.timer.once(500, this, () => { this.isHited = false })
    }
}