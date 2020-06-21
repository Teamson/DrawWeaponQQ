import PlayerDataMgr from "../Libs/PlayerDataMgr"
import TimeCountMgr from "../Libs/TimeCountMgr"
import JJMgr, { SceneDir } from "../JJExport/Common/JJMgr"
import GameLogic from "../Crl/GameLogic"
import Utility from "../Mod/Utility"
import WxApi from "../Libs/WxApi"

export default class GameTopNode extends Laya.Script {
    constructor() {
        super()
    }

    public static Share: GameTopNode

    /**  @prop {name:coinNum,tips:"",type:Node}*/
    public coinNum: Laya.FontClip
    /**  @prop {name:powerNum,tips:"",type:Node}*/
    public powerNum: Laya.FontClip
    /**  @prop {name:gradeNum,tips:"",type:Node}*/
    public gradeNum: Laya.Label
    /**  @prop {name:keyNode,tips:"",type:Node}*/
    public keyNode: Laya.Sprite
    /**  @prop {name:bar,tips:"",type:Node}*/
    public bar: Laya.Image
    /**  @prop {name:bossPic,tips:"",type:Node}*/
    public bossPic: Laya.Image
    /**  @prop {name:powerTime,tips:"",type:Node}*/
    public powerTime: Laya.Label
    /**  @prop {name:txNode,tips:"",type:Node}*/
    public txNode: Laya.Sprite

    onEnable() {
        GameTopNode.Share = this

        this.calculateTime()
        Laya.timer.loop(1000, this, this.calculateTime)
        this.initData();

        (this.txNode.getChildByName('txBtn') as Laya.Image).on(Laya.Event.CLICK, this, this.txBtnCB);
        Laya.timer.frameLoop(2, this, () => {
            (this.txNode.getChildByName('curNum') as Laya.Label).text = PlayerDataMgr.getPacketData().curCash.toFixed(2);
        })
    }
    txBtnCB() {
        Laya.Scene.open('MyScenes/TakeCashUI.scene', false)
    }


    initData() {
        this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString()
        this.powerNum.value = PlayerDataMgr.getPlayerData().power.toString()
        this.gradeNum.text = PlayerDataMgr.getPlayerData().grade.toString()
        this.bar.width = (PlayerDataMgr.getPlayerData().gradeIndex + 1) / 4 * 480
        this.bossPic.visible = this.bar.width >= 480

        let g = Math.floor(PlayerDataMgr.getPlayerData().grade % 4) == 0 ? 4 : Math.floor(PlayerDataMgr.getPlayerData().grade % 4)
        for (let i = 0; i < this.keyNode.numChildren; i++) {
            let key: Laya.Image = this.keyNode.getChildAt(i) as Laya.Image
            key.skin = g > i + 1 ? 'mainUI/sy-ys1.png' : 'mainUI/sy-ys2.png'
        }
    }

    onDisable() {
        Laya.timer.clearAll(this)
    }

    onUpdate() {
        this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString()
    }

    calculateTime() {
        let t = TimeCountMgr.Share.tCount
        let m = Math.floor(t / 60)
        let s = Math.floor(t - m * 60)
        this.powerTime.text = m.toString() + ':' + s.toString()

        this.powerNum.value = PlayerDataMgr.getPlayerData().power.toString()

        this.powerTime.visible = PlayerDataMgr.getPlayerData().power < 10
    }

}