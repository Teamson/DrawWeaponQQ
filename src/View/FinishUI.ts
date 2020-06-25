import PlayerDataMgr from "../Libs/PlayerDataMgr"
import GameLogic from "../Crl/GameLogic"
import ShareMgr from "../Mod/ShareMgr"
import WxApi from "../Libs/WxApi"
import JJMgr, { SceneDir } from "../JJExport/Common/JJMgr"
import AdMgr from "../Mod/AdMgr"
import Utility from "../Mod/Utility"

export default class FinishUI extends Laya.Scene {
    constructor() {
        super()
    }

    openBoxBtn: Laya.Image = this['openBoxBtn']
    videoBtn: Laya.Image = this['videoBtn']
    noBtn: Laya.Image = this['noBtn']
    bounes: Laya.Image = this['bounes']
    moreGameBtn: Laya.Image = this['moreGameBtn']

    boxBtnEnabled: boolean = true

    onOpened(param?: any) {

        WxApi.aldEvent('第' + PlayerDataMgr.getPlayerData().grade + '关：通关')
        this.initData()

        AdMgr.instance.hideBanner()
    }

    onClosed() {
        AdMgr.instance.hideBanner()
        Laya.timer.clearAll(this)
    }

    initData() {
        this.openBoxBtn.on(Laya.Event.CLICK, this, this.openBoxCB)
        this.videoBtn.on(Laya.Event.CLICK, this, this.videoBtnCB)
        this.noBtn.on(Laya.Event.CLICK, this, this.noBtnCB)
        this.moreGameBtn.on(Laya.Event.CLICK, this, this.moreGameBtnCB)
        Utility.rotateLoop(this.moreGameBtn.getChildAt(0), 15, 100)

        let grade = PlayerDataMgr.getPlayerData().grade - 1
        let g = Math.floor(grade % 4) == 0 ? 4 : Math.floor(grade % 4)
        this.bounes.skin = g == 4 ? 'finishUI/js-bx.png' : 'finishUI/js-ys.png'
        this.openBoxBtn.visible = g == 4
        this.videoBtn.visible = g != 4
        this.noBtn.visible = g != 4

        if (JJMgr.instance.dataConfig.front_box_ads) {
            this['btnNode'].visible = false
            AdMgr.instance.showAppBox(() => {
                this.closeAppCB()
            })
            Laya.timer.once(7000, this, this.closeAppCB)
        } else {
            if (this.noBtn.visible)
                WxApi.fixBtnTouchPos(this.noBtn, 320, 100, this)
            else {
                this.boxBtnEnabled = false
                WxApi.fixBtnTouchPos(this.openBoxBtn, 320, 0, this, () => { this.boxBtnEnabled = true })
            }
        }

        GameLogic.Share.isHelpStart = false
        GameLogic.Share.gradeIndex = 0
        PlayerDataMgr.getPlayerData().gradeIndex = 0
        PlayerDataMgr.setPlayerData()


        this['bounesCoin'].visible = GameLogic.Share.gotKillBossBounes
        if (GameLogic.Share.gotKillBossBounes) {
            GameLogic.Share.gotKillBossBounes = false
            let c = Utility.GetRandom(30, 100)
            this['bounesCoin'].text = '成功领取' + c + '金币'
            Utility.tMove2D(this['bounesCoin'], this['bounesCoin'].x, this['bounesCoin'].y - 100, 2000, () => { this['bounesCoin'].visible = false })
            PlayerDataMgr.changeCoin(c)
        }
    }

    closeAppCB() {
        let self = this
        AdMgr.instance.closeAppBox()
        Laya.timer.clearAll(this)
        self['btnNode'].visible = true
        if (self.noBtn.visible)
            WxApi.fixBtnTouchPos(self.noBtn, 320, 100, self)
        else {
            self.boxBtnEnabled = false
            WxApi.fixBtnTouchPos(self.openBoxBtn, 320, 0, self, () => { self.boxBtnEnabled = true })
        }
    }

    moreGameBtnCB() {
        AdMgr.instance.showAppBox()
    }

    openBoxCB() {
        if (!this.boxBtnEnabled) return
        Laya.Scene.open('MyScenes/BoxUI.scene')
    }

    videoBtnCB() {
        WxApi.aldEvent('视频/分享打开宝箱：点击')
        let cb: Function = () => {
            WxApi.aldEvent('视频/分享打开宝箱：成功')
            Laya.Scene.open('MyScenes/BoxUI.scene')
        }
        ShareMgr.instance.shareGame(cb)
    }

    noBtnCB() {
        this.close()
        Laya.Scene.open('MyScenes/GameUI.scene', false, () => {
            GameLogic.Share.restartGame()
            if (JJMgr.instance.dataConfig.front_box_ads)
                AdMgr.instance.showAppBox()
        })
    }
}