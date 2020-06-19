import PlayerDataMgr from "../Libs/PlayerDataMgr"
import GameLogic from "../Crl/GameLogic"
import Utility from "../Mod/Utility"
import ShareMgr from "../Mod/ShareMgr"
import WxApi from "../Libs/WxApi"
import AdMgr from "../Mod/AdMgr"

export default class FreeSkinUI extends Laya.Scene {
    constructor() {
        super()
    }

    closeBtn: Laya.Image = this['closeBtn']
    itemNode: Laya.Sprite = this['itemNode']
    randBtn: Laya.Image = this['randBtn']

    skinArr: number[] = []

    onOpened(param?: any) {
        this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB)
        this.randBtn.on(Laya.Event.CLICK, this, this.randBtnCB)
        this.skinArr = PlayerDataMgr.getFreeSkins()

        this.initData()
        WxApi.fixBtnTouchPos(this.closeBtn, 770, 540, this)
    }

    onClosed() {
        AdMgr.instance.hideBanner()
    }

    initData() {
        for (let i = 0; i < 4; i++) {
            let item = this.itemNode.getChildAt(i) as Laya.Image
            if (i >= this.skinArr.length) {
                item.visible = false
                continue
            }
            let icon = item.getChildByName('icon') as Laya.Image
            icon.skin = 'freeSkins/HeroD_' + (this.skinArr[i] + 1) + '.png'
            let id = this.skinArr[i]
            item.off(Laya.Event.CLICK, this, this.itemCB)
            item.on(Laya.Event.CLICK, this, this.itemCB, [id])
        }
    }

    itemCB(id: number) {
        WxApi.aldEvent('试用皮肤：点击')
        let cb: Function = () => {
            WxApi.aldEvent('试用皮肤：成功')
            PlayerDataMgr.freeSkinId = id
            GameLogic.Share.changePlayerSkin(id)
            this.closeBtnCB()
        }
        ShareMgr.instance.shareGame(cb)
    }

    randBtnCB() {
        let id = Utility.getRandomItemInArr(this.skinArr)
        this.itemCB(id)
    }

    closeBtnCB() {
        this.close()
        GameLogic.Share.canReady = true
        GameLogic.Share.readyGo()
    }
}