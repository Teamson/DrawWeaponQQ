import PlayerDataMgr from "../Libs/PlayerDataMgr"
import Utility from "../Mod/Utility"
import GameTopNode from "./GameTopNode"
import ShareMgr from "../Mod/ShareMgr"
import WxApi from "../Libs/WxApi"
import JJMgr, { SceneDir } from "../JJExport/Common/JJMgr"
import AdMgr from "../Mod/AdMgr"

export default class OfflineUI extends Laya.Scene {
    constructor() {
        super()
    }

    coinNum: Laya.FontClip = this['coinNum']
    noBtn: Laya.Image = this['noBtn']
    trippleBtn: Laya.Image = this['trippleBtn']
    toggleBtn: Laya.Image = this['toggleBtn']
    point: Laya.Image = this['point']

    exTimeMin: number = 0
    bounesNum: number = 0
    bounesNumTriple: number = 0

    isTripple: boolean = true
    updateCompleted: boolean = true

    onOpened(param?: any) {
        WxApi.isShowAppBox = false
        this.toggleBtn.on(Laya.Event.CLICK, this, this.trippleBtnCB)
        this.trippleBtn.on(Laya.Event.CLICK, this, this.getBounesCB)
        this.noBtn.on(Laya.Event.CLICK, this, this.getBounesCB)

        this.exTimeMin = param
        this.bounesNum = PlayerDataMgr.getPlayerOffline(this.exTimeMin)
        this.bounesNumTriple = this.bounesNum * 3

        this.initData()
        AdMgr.instance.showBanner()
    }

    onClosed() {
        AdMgr.instance.hideBanner()
        if (localStorage.getItem('lastDate') && !WxApi.isShowAppBox && JJMgr.instance.dataConfig.front_box_ads) {
            WxApi.isShowAppBox = true
            AdMgr.instance.showAppBox()
        }
    }

    initData() {
        this.coinNum.value = this.bounesNumTriple.toString()
        this.changePoint()
        this.changeBtn()
    }

    trippleBtnCB() {
        if (!this.updateCompleted) return
        this.updateCompleted = false
        this.isTripple = !this.isTripple
        this.changePoint()
        this.changeBtn()
        Utility.updateNumber(this.bounesNum, 3, this.coinNum, false, this.isTripple, () => {
            this.updateCompleted = true
        })
    }

    getBounesCB() {
        let cb: Function = () => {
            if (this.isTripple)
                WxApi.aldEvent('离线收益三倍：成功')
            PlayerDataMgr.changeCoin(this.isTripple ? this.bounesNumTriple : this.bounesNum)
            GameTopNode.Share.initData()
            this.close()
        }
        if (this.isTripple) {
            WxApi.aldEvent('离线收益三倍：点击')
            ShareMgr.instance.shareGame(cb)
        } else {
            cb()
        }
    }

    changePoint() {
        this.point.skin = this.isTripple ? 'offlineUI/lx-yuan.png' : 'offlineUI/lx-yuan2.png'
    }

    changeBtn() {
        this.noBtn.visible = !this.isTripple
        this.trippleBtn.visible = this.isTripple
    }
}