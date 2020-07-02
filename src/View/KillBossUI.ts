import AdMgr from "../Mod/AdMgr"
import PrefabManager, { PrefabItem } from "../Libs/PrefabManager"
import WxApi from "../Libs/WxApi"
import JJMgr from "../JJExport/Common/JJMgr"
import PlayerDataMgr from "../Libs/PlayerDataMgr"
import Utility from "../Mod/Utility"
import GameLogic from "../Crl/GameLogic"

export default class KillBossUI extends Laya.Scene {
    constructor() {
        super()
    }

    closeBtn: Laya.Image = this['closeBtn']
    barNode: Laya.ProgressBar = this['barNode']
    clickBtn: Laya.Image = this['clickBtn']
    atkAni: Laya.Animation = this['atkAni']
    clickBossBtn: Laya.Image = this['clickBossBtn']

    isBannerType: boolean = true

    curProgress: number = 0

    closeCallback: Function = null

    hadShowBanner: boolean = false

    canShowBox: boolean = true

    onOpened(param?: any) {
        if (param != null && param != undefined) {
            this.closeCallback = param
        }
        this.atkAni.loop = false

        let randNum = Math.random() * 100
        if (randNum <= JJMgr.instance.dataConfig.front_banner_probability) {
            this.isBannerType = true
            this.clickBtn.visible = true
            this.clickBossBtn.visible = false
        } else {
            this.isBannerType = false
            this.clickBtn.visible = false
            this.clickBossBtn.visible = true
        }

        this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB)

        this.clickBtn.on(Laya.Event.MOUSE_DOWN, this, this.clickBtnCBDown)
        this.clickBtn.on(Laya.Event.MOUSE_UP, this, this.clickBtnCBUp)
        this.clickBossBtn.on(Laya.Event.MOUSE_DOWN, this, this.clickBossBtnCB)

        Utility.visibleDelay(this.closeBtn, 3000)

        Laya.timer.frameLoop(1, this, this.decBar)

        WxApi.isKillBossUI = true
        WxApi.WxOnHide(() => {
            if (WxApi.isKillBossUI) {
                Laya.timer.once(100, this, () => { Laya.Scene.close('MyScenes/KillBossUI.scene') })
            }
        })

        AdMgr.instance.hideBanner()

        Laya.timer.once(5000, this, () => {
            this.close()
        })
        Laya.timer.once(4000, this, () => {
            this.canShowBox = false
            AdMgr.instance.closeAppBox()
        })
    }

    onClosed() {
        AdMgr.instance.closeAppBox()
        Laya.timer.clearAll(this)
        this.closeCallback && this.closeCallback()
        WxApi.isKillBossUI = false
    }

    decBar() {
        if (this.curProgress >= 1) {
            Laya.timer.clear(this, this.decBar)
            return
        }

        this.curProgress -= 0.005
        if (this.curProgress < 0) {
            this.curProgress = 0
        }

        this.barNode.value = this.curProgress
    }

    clickBtnCBDown() {
        GameLogic.Share.gotKillBossBounes = true
        let curG = WxApi.tempGrade
        let gGap = (curG - JJMgr.instance.dataConfig.front_box_gate) % JJMgr.instance.dataConfig.front_box_everygate == 0 &&
            curG >= JJMgr.instance.dataConfig.front_box_gate

        if (!this.hadShowBanner && gGap && WxApi.isValidBanner(curG)) {
            this.hadShowBanner = true
            Laya.timer.once(500, this, () => {
                AdMgr.instance.showBanner()
            })
        }

        this.atkAni.play(0, false)
        this.clickBtn.scaleX = 1.2
        this.clickBtn.scaleY = 1.2

        this.curProgress += 0.15
        if (this.curProgress > 1) {
            this.curProgress = 1
            this.barNode.value = 1
            this.close()
            return
        }

        this.createCoin()
        this.createCoin()
        this.createCoin()
        this.createCoin()
        this.createCoin()
    }
    clickBtnCBUp() {
        this.clickBtn.scaleX = 1
        this.clickBtn.scaleY = 1
    }

    clickBossBtnCB() {
        GameLogic.Share.gotKillBossBounes = true
        let curG = WxApi.tempGrade
        let gGap = (curG - JJMgr.instance.dataConfig.front_box_gate) % JJMgr.instance.dataConfig.front_box_everygate == 0 &&
            curG >= JJMgr.instance.dataConfig.front_box_gate

        if (!this.hadShowBanner && gGap && this.canShowBox && WxApi.isValidBanner(curG)) {
            this.hadShowBanner = true
            Laya.timer.once(500, this, () => {
                AdMgr.instance.showAppBox()
            })
        }

        this.curProgress += 0.15
        if (this.curProgress > 1) {
            this.curProgress = 1
            this.barNode.value = 1
            this.close()
            return
        }

        this.createCoin()
        this.createCoin()
        this.createCoin()
        this.createCoin()
        this.createCoin()
    }

    closeBtnCB() {
        this.close()
    }

    createCoin() {
        let coin = PrefabManager.instance().getItem(PrefabItem.Coin) as Laya.Image
        this.addChild(coin)
        coin.pos(375, 500)

        let desPos = new Laya.Vector2(Math.random() * 400 - 200, Math.random() * 400 - 200)
        Laya.Tween.to(coin, { x: desPos.x + 375, y: desPos.y + 500 }, 200);

        Laya.timer.once(1000, this, () => {
            coin.destroy()
        })
    }
}