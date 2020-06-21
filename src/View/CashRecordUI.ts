export default class CashRecordUI extends Laya.Scene {
    constructor() {
        super()
    }

    closeBtn: Laya.Image = this['closeBtn']

    onOpened() {
        this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB)
    }

    onClosed() {

    }

    closeBtnCB() {
        this.close()
    }
}