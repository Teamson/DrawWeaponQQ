import PlayerDataMgr from "../Libs/PlayerDataMgr"
import WxApi from "../Libs/WxApi"
import SkinUIPlayer from "../Crl/SkinUIPlayer"
import GameLogic from "../Crl/GameLogic"
import Utility from "../Mod/Utility"
import GameTopNode from "./GameTopNode"
import ShareMgr from "../Mod/ShareMgr"
import AdMgr from "../Mod/AdMgr"
import JJMgr, { SceneDir } from "../JJExport/Common/JJMgr"
import GameUI from "./GameUI"

export default class SkinUI extends Laya.Scene {
    constructor() {
        super()
    }

    topBar: Laya.Image = this['topBar']
    backBtn: Laya.Image = this['backBtn']
    coinNum: Laya.FontClip = this['coinNum']
    typePic: Laya.Image = this['typePic']
    itemNode: Laya.Sprite = this['itemNode']
    leftBtn: Laya.Image = this['leftBtn']
    rightBtn: Laya.Image = this['rightBtn']
    pointNode: Laya.Sprite = this['pointNode']
    btn1: Laya.Image = this['btn1']
    btn2: Laya.Image = this['btn2']
    btn3: Laya.Image = this['btn3']

    pageIndex: number = 0

    onOpened(param?: any) {
        this.backBtn.on(Laya.Event.CLICK, this, this.backBtnCB)
        this.leftBtn.on(Laya.Event.CLICK, this, this.turnPageCB, [true])
        this.rightBtn.on(Laya.Event.CLICK, this, this.turnPageCB, [false])
        this.leftBtn.visible = false
        this.btn1.on(Laya.Event.CLICK, this, this.btnCB1)
        this.btn2.on(Laya.Event.CLICK, this, this.btnCB2)

        this.updateCoinNum()
        this.initData()

        this.init3DScene()
    }

    onClosed() {
    }

    scene3D: Laya.Scene3D = null
    light = null
    camera = null
    role: Laya.Sprite3D = null
    roleCrl: SkinUIPlayer = null
    init3DScene() {
        this.scene3D = Laya.stage.addChild(new Laya.Scene3D()) as Laya.Scene3D;
        this.light = this.scene3D.addChild(new Laya.DirectionLight()) as Laya.DirectionLight;
        this.light.color = new Laya.Vector3(1, 0.956, 0.839);
        this.light.transform.rotate(new Laya.Vector3(59.3, -55.16, 0), true, false);

        this.camera = this.scene3D.addChild(new Laya.Camera(0, 0.1, 100)) as Laya.Camera;
        this.camera.transform.translate(new Laya.Vector3(0, 2, 7));
        this.camera.transform.rotate(new Laya.Vector3(-10, 0, 0), true, false);
        this.camera.clearFlag = Laya.BaseCamera.CLEARFLAG_DEPTHONLY;
        this.fixCameraField()

        let playerRes: Laya.Sprite3D = Laya.loader.getRes(WxApi.UnityPath + 'Hero_1.lh') as Laya.Sprite3D
        this.role = Laya.Sprite3D.instantiate(playerRes, this.scene3D, false, new Laya.Vector3(0, 0, 0));
        this.role.transform.position = new Laya.Vector3(0, 2.6, 0);
        this.role.transform.rotationEuler = new Laya.Vector3(0, 0, 0);
        this.role.transform.setWorldLossyScale(new Laya.Vector3(0.5, 0.5, 0.5));
        this.roleCrl = this.role.addComponent(SkinUIPlayer) as SkinUIPlayer
    }

    fixCameraField() {
        let staticDT: number = 1624 - 1334
        let curDT: number = Laya.stage.displayHeight - 1334 < 0 ? 0 : Laya.stage.displayHeight - 1334
        let per = curDT / staticDT * 10
        this.camera.fieldOfView += per
    }

    initData() {
        this.typePic.skin = 'skinUI/pf-an' + (this.pageIndex + 1) + '.png'
        for (let i = 0; i < this.pointNode.numChildren; i++) {
            let p = this.pointNode.getChildAt(i) as Laya.Image
            p.skin = i == this.pageIndex ? 'skinUI/pf-yuan2.png' : 'skinUI/pf-yuan1.png'
        }

        let coinNum = this.btn1.getChildAt(0) as Laya.Label
        coinNum.text = PlayerDataMgr.getUnlockSkinCost().toString()

        this.btn1.visible = this.pageIndex == 0
        this.btn2.visible = this.pageIndex == 1
        this.btn3.visible = this.pageIndex == 2

        this.initItem()
    }

    initItem() {
        for (let i = 0; i < this.itemNode.numChildren; i++) {
            let item = this.itemNode.getChildAt(i) as Laya.Image
            let icon = item.getChildByName('icon') as Laya.Image
            let tick = item.getChildByName('tick') as Laya.Image
            item.off(Laya.Event.CLICK, this, this.itemCB)

            let index = i + this.pageIndex * 9
            let isHave: boolean = PlayerDataMgr.getPlayerData().playerArr[index] >= 0

            let skinArr = PlayerDataMgr.skinArr1
            switch (this.pageIndex) {
                case 0:
                    skinArr = PlayerDataMgr.skinArr1
                    break
                case 1:
                    skinArr = PlayerDataMgr.skinArr2
                    break
                case 2:
                    skinArr = PlayerDataMgr.skinArr3
                    break
            }
            if (i + 1 <= skinArr.length) {
                icon.visible = isHave
                item.skin = isHave ? 'skinUI/pf-di2.png' : 'skinUI/pf-di.png'
                if (isHave) {
                    icon.skin = 'heroSkins/Hero_' + (skinArr[i] + 1) + '.png'
                    item.on(Laya.Event.CLICK, this, this.itemCB, [index])
                }
                tick.visible = isHave && PlayerDataMgr.getPlayerData().playerId == skinArr[i]
            } else {
                tick.visible = false
                icon.visible = false
                item.skin = 'skinUI/pf-di.png'
            }
        }
    }

    itemCB(id: number) {
        PlayerDataMgr.getPlayerData().playerId = PlayerDataMgr.getPlayerData().playerArr[id]
        this.roleCrl.changeSkin(PlayerDataMgr.getPlayerData().playerId)
        GameLogic.Share.changePlayerSkin()
        this.initData()
    }

    updateCoinNum() {
        this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString()
        GameTopNode.Share.initData()
    }

    turnPageCB(isLeft: boolean) {
        if (isLeft) {
            this.pageIndex--
        } else {
            this.pageIndex++
        }
        this.leftBtn.visible = this.pageIndex > 0
        this.rightBtn.visible = this.pageIndex < 2
        this.initData()
    }

    btnCB1() {
        let skinArr = [].concat(PlayerDataMgr.getCoinSkins())
        if (skinArr.length <= 0) {
            WxApi.OpenAlert('敬请期待！')
            return
        }
        WxApi.aldEvent('皮肤界面：金币解锁')
        let cost = PlayerDataMgr.getUnlockSkinCost()
        if (cost > PlayerDataMgr.getPlayerData().coin) {
            WxApi.OpenAlert('金币不足！')
            return
        }

        WxApi.aldEvent('皮肤界面：金币解锁成功')
        PlayerDataMgr.getPlayerData().unlockSkinCount++
        PlayerDataMgr.changeCoin(-cost)
        this.updateCoinNum()
        let value = Utility.getRandomItemInArr(skinArr)
        let skinId = PlayerDataMgr.skinArr1.indexOf(value)
        PlayerDataMgr.getPlayerSkin(skinId, value)
        this.roleCrl.changeSkin(PlayerDataMgr.getPlayerData().playerId)
        GameLogic.Share.changePlayerSkin()
        this.initData()
    }

    btnCB2() {
        let skinArr = [].concat(PlayerDataMgr.getVideoSkins())
        console.log(skinArr)
        if (skinArr.length <= 0) {
            WxApi.OpenAlert('敬请期待！')
            return
        }
        WxApi.aldEvent('皮肤界面：视频/分享解锁')
        let cb: Function = () => {
            WxApi.aldEvent('皮肤界面：视频/分享解锁成功')
            let value = Utility.getRandomItemInArr(skinArr)
            let skinId = PlayerDataMgr.skinArr2.indexOf(value) + 9
            PlayerDataMgr.getPlayerSkin(skinId, value)
            this.roleCrl.changeSkin(PlayerDataMgr.getPlayerData().playerId)
            GameLogic.Share.changePlayerSkin()
            this.initData()
        }
        ShareMgr.instance.shareGame(cb)
    }

    backBtnCB() {
        this.scene3D.destroy()
        this.close()
    }
}