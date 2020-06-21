import PlayerDataMgr from "../Libs/PlayerDataMgr"
import WxApi from "../Libs/WxApi"

export default class TakeCashUI extends Laya.Scene {
    constructor() {
        super()
    }

    curNum: Laya.Label = this['curNum']
    recordBtn: Laya.Image = this['recordBtn']
    closeBtn: Laya.Image = this['closeBtn']
    cashNode: Laya.Sprite = this['cashNode']
    takeCashBtn: Laya.Image = this['takeCashBtn']

    curSelectId: number = 0

    onOpened() {
        this.recordBtn.on(Laya.Event.CLICK, this, this.recordBtnCB)
        this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB)
        this.takeCashBtn.on(Laya.Event.CLICK, this, this.takeCashBtnCB)

        this.curNum.text = PlayerDataMgr.getPacketData().curCash.toFixed(2)

        for (let i = 0; i < this.cashNode.numChildren; i++) {
            let item = this.cashNode.getChildAt(i) as Laya.Image
            item.on(Laya.Event.CLICK, this, this.clickItem, [i])
        }
        this.clickItem(0)
    }

    onDisable() {

    }

    clickItem(id: number) {
        for (let i = 0; i < this.cashNode.numChildren; i++) {
            let item = this.cashNode.getChildAt(i) as Laya.Image
            if (i == id) {
                item.skin = 'packetsUI/hb-kuang2.png'
            } else {
                item.skin = 'packetsUI/hb-kuang.png'
            }
            this.curSelectId = id
        }
    }

    recordBtnCB() {
        Laya.Scene.open('MyScenes/CashRecordUI.scene', false)
    }

    takeCashBtnCB() {
        WxApi.OpenAlert('余额不足')
    }

    closeBtnCB() {
        this.close()
    }
}