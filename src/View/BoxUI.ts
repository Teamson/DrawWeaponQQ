import GameLogic from "../Crl/GameLogic"
import PlayerDataMgr from "../Libs/PlayerDataMgr"
import Utility from "../Mod/Utility"
import SoundMgr from "../Mod/SoundMgr"
import ShareMgr from "../Mod/ShareMgr"
import WxApi from "../Libs/WxApi"
import AdMgr from "../Mod/AdMgr"
import JJMgr from "../JJExport/Common/JJMgr"

export default class BoxUI extends Laya.Scene {
    constructor() {
        super()
    }

    backBtn: Laya.Image = this['backBtn']
    coinNum: Laya.FontClip = this['coinNum']
    skinIcon: Laya.Image = this['skinIcon']
    boxNode: Laya.Sprite = this['boxNode']
    keyNode: Laya.Sprite = this['keyNode']
    videoBtn: Laya.Image = this['videoBtn']

    keyNum: number = 3
    clickCount: number = 0
    skinId: number = -1
    skinIndex: number = -1
    gotBounes: boolean = false

    onOpened(param?: any) {
        this.backBtn.on(Laya.Event.CLICK, this, this.backBtnCB)
        this.videoBtn.on(Laya.Event.CLICK, this, this.videoBtnCB)
        this.initKey()
        this.initCoin()
        this.getBoxSkinId()
        for (let i = 0; i < this.boxNode.numChildren; i++) {
            let item = this.boxNode.getChildAt(i) as Laya.Image
            item.on(Laya.Event.CLICK, this, this.itemCB, [i])
            let coinNode = item.getChildByName('coinNode') as Laya.Image
            coinNode.visible = false
        }
    }

    onClosed() {
        if (JJMgr.instance.dataConfig.front_box_ads)
            AdMgr.instance.showAppBox()
    }

    getBoxSkinId() {
        let arr: number[] = PlayerDataMgr.getBoxSkins()
        if (arr.length <= 0) {
            this.skinId = -1
            this.skinIcon.skin = 'mainUI/sy-jb.png'
            return
        }
        this.skinIndex = Math.floor(Math.random() * arr.length)
        this.skinId = arr[this.skinIndex]

        if (this.skinId == -1) {
            this.skinIcon.skin = 'mainUI/sy-jb.png'
        } else {
            this.skinIcon.skin = PlayerDataMgr.getHeroSkinDir(this.skinId)
        }
    }

    initKey() {
        for (let i = 0; i < 3; i++) {
            let key = this.keyNode.getChildAt(i) as Laya.Image
            key.skin = i < this.keyNum ? 'boxUI/bx-ys1.png' : 'boxUI/bx-ys2.png'
        }
    }

    initCoin() {
        this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString()
    }

    itemCB(id: number) {
        let item = this.boxNode.getChildAt(id) as Laya.Image
        let box = item.getChildByName('box') as Laya.Image
        let coinNode = item.getChildByName('coinNode') as Laya.Image
        let coinNum = coinNode.getChildByName('coinNum') as Laya.FontClip

        if (item.skin == 'boxUI/bx-di2.png' || this.keyNum <= 0) return
        item.skin = 'boxUI/bx-di2.png'
        this.keyNum--
        this.clickCount++
        this.initKey()
        if (this.clickCount >= 9) {
            this.keyNode.visible = false
            this.videoBtn.visible = false
        } else if (this.keyNum <= 0) {
            this.keyNode.visible = false
            this.videoBtn.visible = true
        }

        let isSkin: boolean = false
        let bounes: number = 5
        let randNum: number = Math.random() * 100
        if (randNum <= 20) {
        } else if (randNum <= 35) {
            bounes = 10
        } else if (randNum <= 45) {
            bounes = 15
        } else if (randNum <= 55) {
            bounes = 20
        } else if (randNum <= 65) {
            bounes = 25
        } else if (randNum <= 75) {
            bounes = 30
        } else if (randNum <= 85) {
            bounes = 35
        } else if (randNum <= 95) {
            bounes = 50
        } else {
            if (this.skinId == -1 || this.gotBounes) {
                isSkin = false
                bounes = 50
            } else {
                this.gotBounes = true
                isSkin = true
            }
        }

        if (this.clickCount >= 9 && this.skinId != -1 && !this.gotBounes) {
            this.gotBounes = true
            isSkin = true
        }

        if (isSkin) {
            PlayerDataMgr.getPlayerSkin(PlayerDataMgr.skinArr3.indexOf(this.skinId) + 18, this.skinId)
            box.visible = true
            box.skin = PlayerDataMgr.getHeroSkinDir(this.skinId)
            box.y = 65
        } else {
            SoundMgr.instance.playSoundEffect('getCoin.mp3')
            PlayerDataMgr.changeCoin(bounes)
            this.initCoin()
            box.visible = false
            coinNode.visible = true
            coinNum.value = bounes.toString()
        }
    }

    videoBtnCB() {
        WxApi.aldEvent('增加三个钥匙：点击')
        let cb: Function = () => {
            WxApi.aldEvent('增加三个钥匙：成功')
            this.keyNum = 3
            this.videoBtn.visible = false
            this.keyNode.visible = true
            this.initKey()
        }
        ShareMgr.instance.shareGame(cb)
    }

    backBtnCB() {
        Laya.Scene.open('MyScenes/GameUI.scene', true, () => { GameLogic.Share.restartGame() })
    }
}