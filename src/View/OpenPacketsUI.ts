import PlayerDataMgr, { PacketData } from "../Libs/PlayerDataMgr"
import WxApi from "../Libs/WxApi"
import JJMgr from "../JJExport/Common/JJMgr"

export default class OpenPacketsUI extends Laya.Scene {
    constructor() {
        super()
    }

    openNode: Laya.Sprite = this['openNode']
    txNode: Laya.Sprite = this['txNode']
    closeOpenNodeBtn: Laya.Image = this['closeOpenNodeBtn']
    openBtn: Laya.Image = this['openBtn']
    tips: Laya.Image = this['tips']
    cashNode: Laya.Sprite = this['cashNode']
    coinNode: Laya.Sprite = this['coinNode']
    closeTxBtn: Laya.Image = this['closeTxBtn']
    cashNum: Laya.Label = this['cashNum']
    getCashNum: Laya.Label = this['getCashNum']
    tixianBtn: Laya.Image = this['tixianBtn']
    coinNum: Laya.Label = this['coinNum']
    getCoinBtn: Laya.Image = this['getCoinBtn']

    isGetCash: boolean = true
    bounesNum: number = 0

    onOpened() {
        this.openBtn.on(Laya.Event.CLICK, this, this.openBtnCB)
        this.closeOpenNodeBtn.on(Laya.Event.CLICK, this, this.close)
        this.closeTxBtn.on(Laya.Event.CLICK, this, this.close)
        this.tixianBtn.on(Laya.Event.CLICK, this, this.txBtnCB)
        this.getCoinBtn.on(Laya.Event.CLICK, this, this.getCoinBtnCB)
    }

    onClosed() {

    }

    visibleOpenNode(vivible: boolean) {
        this.openNode.visible = vivible
    }

    visibleTXNode(vivible: boolean) {
        this.txNode.visible = vivible
    }

    openBtnCB() {
        this.visibleOpenNode(false)
        this.visibleTXNode(true)

        let packetData: PacketData = PlayerDataMgr.getPacketData()
        let videoCount: number = packetData.videoCount
        let maxCash: number = packetData.curStateCash
        if (videoCount < 3) {
            this.isGetCash = true
        } else {
            let cashPer: number = JJMgr.instance.dataConfig.front_luckymoney_probability
            let randNum: number = Math.random() * 100
            this.isGetCash = cashPer < randNum
        }
        if (this.isGetCash) {
            let b: number = 0
            switch (videoCount) {
                case 0:
                    b = Math.random() * 0.1 + 0.4
                    b.toFixed(2)
                    break
                case 1:
                    b = Math.random() * 0.19 + 0.2
                    b.toFixed(2)
                    break
                case 2:
                    b = Math.random() * 0.19 + 0.2
                    b.toFixed(2)
                    break
                case 3:
                    b = Math.random() * 0.05 + 0.1
                    b.toFixed(2)
                    break
            }
            this.bounesNum = b
        } else {
            this.bounesNum = Math.floor(Math.random() * 200 + 100)
        }
    }

    txBtnCB() {
        this.close()
        Laya.Scene.open('MyScenes/TakeCashUI.scene')
    }

    getCoinBtnCB() {

    }
}