import Utility from "../Mod/Utility"
import GameLogic from "../Crl/GameLogic"
import PlayerDataMgr from "../Libs/PlayerDataMgr"
import WxApi from "../Libs/WxApi"
import GameTopNode from "./GameTopNode"
import PrefabManager, { PrefabItem } from "../Libs/PrefabManager"
import FixPlayerHpBar from "../Crl/FixPlayerHpBar"
import FixAiTips from "../Crl/FixAiTips"
import SoundMgr from "../Mod/SoundMgr"
import ShareMgr from "../Mod/ShareMgr"
import JJMgr, { SceneDir } from "../JJExport/Common/JJMgr"
import AdMgr from "../Mod/AdMgr"

export default class GameUI extends Laya.Scene {
    constructor() {
        super()
    }

    public static Share: GameUI

    touchPanel: Laya.Panel = this['touchPanel']
    touchNode: Laya.Panel = this['touchNode']
    drawSp: Laya.Sprite = this['drawSp']

    btnNode: Laya.Sprite = this['btnNode']
    noPowerNode: Laya.Sprite = this['noPowerNode']
    upgradeNode: Laya.Sprite = this['upgradeNode']
    closeUpgradePlane: Laya.Panel = this['closeUpgradePlane']
    moveNode: Laya.Sprite = this['moveNode']
    item1: Laya.Image = this['item1']
    item2: Laya.Image = this['item2']
    item3: Laya.Image = this['item3']
    getPowerBtn: Laya.Image = this['getPowerBtn']
    upgradeBtn: Laya.Image = this['upgradeBtn']
    skinBtn: Laya.Image = this['skinBtn']
    reviveBtn: Laya.Image = this['reviveBtn']
    startBtn: Laya.Image = this['startBtn']
    overNode: Laya.Sprite = this['overNode']
    bottomNode: Laya.Sprite = this['bottomNode']
    gameOverNode: Laya.Sprite = this['gameOverNode']
    helpBtn: Laya.Image = this['helpBtn']
    giveUpBtn: Laya.Image = this['giveUpBtn']
    gameOverBtnNode: Laya.Sprite = this['gameOverBtnNode']
    playerHp: Laya.Sprite = this['playerHp']
    aiHp: Laya.Sprite = this['aiHp']
    moreGameBtn: Laya.Image = this['moreGameBtn']
    getBounesBtn: Laya.Image = this['getBounesBtn']

    touchStarted: boolean = false
    startPos: Laya.Vector2 = null
    lineArr: number[] = []
    lineArrVec2: Laya.Vector2[] = []

    onOpened(param?: any) {
        GameUI.Share = this
        this.initData()

        param && param()
        Laya.timer.frameLoop(1, this, this.checkIsNoPower)

        let showOL: boolean = false
        if (!WxApi.launchGameUI) {
            WxApi.GetLaunchParam((p) => {
                let et = PlayerDataMgr.getPlayerData().exitTime
                if (et > 0) {
                    let curT = new Date().getTime()
                    let diffT = Math.floor((curT - et) / 1000 / 60)
                    if (diffT >= 1) {
                        Laya.Scene.open('MyScenes/OfflineUI.scene', false, diffT)
                        showOL = true
                    }
                }
            })
            WxApi.launchGameUI = true
            GameLogic.Share.checkCanUpgrade()
        }
        if (!showOL && localStorage.getItem('lastDate') && !WxApi.isShowAppBox && JJMgr.instance.dataConfig.front_box_ads) {
            WxApi.isShowAppBox = true
            AdMgr.instance.showAppBox()
        }

        this['drawTips'].visible = PlayerDataMgr.getPlayerData().grade <= 2
        this['drawTips'].skin = PlayerDataMgr.getPlayerData().grade == 1 ? 'mainUI/sy_ck2.png' : 'mainUI/sy_ck1.png'

        if (!localStorage.getItem('guide') && PlayerDataMgr.getPlayerData().grade == 1) {
            this['fingerAni'].visible = true
        } else {
            this['fingerAni'].visible = false
        }

        SoundMgr.instance.playMusic('bgm.mp3')

        if (!GameLogic.Share.isBanGameUIBanner) {
            AdMgr.instance.hideBanner()
        } else {
            GameLogic.Share.isBanGameUIBanner = false
        }

    }

    onClosed() {
        Laya.timer.clearAll(this)
    }

    initData() {
        this.touchPanel.y = Utility.fixPosY(this.touchPanel.y)
        this.bottomNode.y = Utility.fixPosY(this.bottomNode.y)
        this.gameOverBtnNode.y = Utility.fixPosY(this.gameOverBtnNode.y)
        this.touchNode.on(Laya.Event.MOUSE_DOWN, this, this.touchStart)
        this.touchNode.on(Laya.Event.MOUSE_MOVE, this, this.touchMove)
        this.touchNode.on(Laya.Event.MOUSE_UP, this, this.touchEnd)
        this.touchNode.on(Laya.Event.MOUSE_OUT, this, this.touchOut)

        this.upgradeBtn.on(Laya.Event.CLICK, this, this.upgradeBtnCB)
        this.skinBtn.on(Laya.Event.CLICK, this, this.skinBtnCB)

        this.item1.on(Laya.Event.CLICK, this, this.upgradePlayerCountCB)
        this.item2.on(Laya.Event.CLICK, this, this.upgradePlayerAtkCB)
        this.item3.on(Laya.Event.CLICK, this, this.upgradeOfflineCB)

        this.reviveBtn.on(Laya.Event.CLICK, this, this.reviveBtnCB)
        this.startBtn.on(Laya.Event.CLICK, this, this.startCB)

        this.helpBtn.on(Laya.Event.CLICK, this, this.helpBtnCB)
        this.giveUpBtn.on(Laya.Event.CLICK, this, this.giveUpBtnCB)

        this.getPowerBtn.on(Laya.Event.CLICK, this, this.getPowerBtnCB)

        this.moreGameBtn.on(Laya.Event.CLICK, this, this.moreGameBtnCB)
        Utility.rotateLoop(this.moreGameBtn.getChildAt(0), 15, 100)

        this.getBounesBtn.on(Laya.Event.CLICK, this, this.getBounesBtnCB)
        Utility.rotateLoop(this.getBounesBtn.getChildAt(0), 15, 100)
        this.getBounesBtn.visible = WxApi.isValidPacket()

        this.updatePlayerItem()
        Laya.timer.loop(1000, this, this.updatePlayerItem)

        GameLogic.Share.canTouch = true

        //Laya.Scene.open('MyScenes/BoxUI.scene')
    }

    moreGameBtnCB() {
        AdMgr.instance.showAppBox()
    }

    //更新升级面板
    updatePlayerItem() {
        let item = null
        let showTips: boolean = false
        for (let i = 1; i <= 3; i++) {
            item = this['item' + i]
            let lvNum = item.getChildByName('lvNum') as Laya.Label
            let cost = item.getChildByName('cost') as Laya.Label
            let panel = item.getChildByName('panel') as Laya.Image

            switch (i) {
                case 1:
                    lvNum.text = '等级：' + PlayerDataMgr.getPlayerCountLv().toString()
                    cost.text = PlayerDataMgr.getUpgradePlayerCountLvCost().toString()
                    panel.visible = PlayerDataMgr.getUpgradePlayerCountLvCost() > PlayerDataMgr.getPlayerData().coin || PlayerDataMgr.getCountLvMax()
                    break
                case 2:
                    lvNum.text = '等级：' + PlayerDataMgr.getPlayerPowerLv().toString()
                    cost.text = PlayerDataMgr.getUpgradePlayerPowerLvCost().toString()
                    panel.visible = PlayerDataMgr.getUpgradePlayerPowerLvCost() > PlayerDataMgr.getPlayerData().coin || PlayerDataMgr.getPowerLvMax()
                    break
                case 3:
                    lvNum.text = '等级：' + PlayerDataMgr.getPlayerOfflineLv().toString()
                    cost.text = PlayerDataMgr.getUpgradeOfflineLvCost().toString()
                    panel.visible = PlayerDataMgr.getUpgradeOfflineLvCost() > PlayerDataMgr.getPlayerData().coin || PlayerDataMgr.getOfflineLvMax()
                    break
            }
            if (!panel.visible) {
                showTips = true
            }
        }
        let tips = this.upgradeBtn.getChildAt(0) as Laya.Image
        tips.visible = showTips
    }

    touchStart(event: Laya.Event) {
        if (!this.safeArea(new Laya.Vector2(event.stageX, event.stageY)) || !GameLogic.Share.canTouch) {
            return
        }
        //关闭引导
        this['fingerAni'].visible = false
        if (!localStorage.getItem('guide')) {
            localStorage.setItem('guide', '1')
        }
        if (PlayerDataMgr.getPlayerData().gradeIndex == 0 && !GameLogic.Share.gameStarted) {
            PlayerDataMgr.getPlayerData().power--
            PlayerDataMgr.setPlayerData()
            GameLogic.Share.gameStarted = true
        }
        this.touchStarted = true
        this.startPos = new Laya.Vector2(event.stageX, event.stageY)
        this.lineArr = []
        this.lineArr.push(this.startPos.x)
        this.lineArr.push(this.startPos.y)
        this.lineArrVec2 = []
        this.lineArrVec2.push(this.startPos)
    }
    touchMove(event: Laya.Event) {
        if (!this.safeArea(new Laya.Vector2(event.stageX, event.stageY)) || !this.touchStarted) {
            return
        }
        let p = new Laya.Vector2(event.stageX, event.stageY)
        let dis = Utility.calcDistance(this.startPos, p)
        if (dis >= 10 && this.lineArrVec2.length < GameLogic.WEAPON_LENGTH_MAX) {
            this.lineArr.push(p.x)
            this.lineArr.push(p.y)
            this.lineArrVec2.push(p)
            this.startPos = p
            this.drawLine()
        }
    }
    touchEnd(event: Laya.Event) {
        if (!this.touchStarted) {
            return
        }
        this.touchStarted = false
        this.drawSp.graphics.clear()
        if (this.lineArrVec2.length < GameLogic.WEAPON_LENGTH_MIN) {
            WxApi.OpenAlert('武器太短啦，请重画！')
            return
        }
        GameLogic.Share.createLine3D(this.lineArrVec2)
    }
    touchOut(event: Laya.Event) {
        if (!this.touchStarted) {
            return
        }
        this.touchStarted = false
        this.drawSp.graphics.clear()
        if (this.lineArrVec2.length < GameLogic.WEAPON_LENGTH_MIN) {
            WxApi.OpenAlert('武器太短啦，请重画！')
            return
        }
        GameLogic.Share.createLine3D(this.lineArrVec2)
    }

    drawLine() {
        this.drawSp.graphics.clear()
        this.drawSp.graphics.drawLines(0, 0, this.lineArr, "#000000", 8)
    }

    //是否点击在绘画区域
    safeArea(pos: Laya.Vector2) {
        let x1 = this.touchPanel.x - this.touchPanel.width / 2
        let x2 = this.touchPanel.x + this.touchPanel.width / 2
        let y1 = this.touchPanel.y - this.touchPanel.height / 2
        let y2 = this.touchPanel.y + this.touchPanel.height / 2
        if (pos.x < x1 || pos.x > x2 || pos.y < y1 || pos.y > y2) {
            return false
        } else {
            return true
        }
    }

    //升级按钮回调
    upgradeBtnCB() {
        if (this.upgradeNode.visible) {
            return
        } else {
            WxApi.aldEvent('首页升级按钮：点击')
            this.upgradeNode.visible = true
            Utility.tMove2D(this.moveNode, -606, this.moveNode.y, 200, () => {
                this.closeUpgradePlane.off(Laya.Event.CLICK, this, this.closeUpgradeNode)
                this.closeUpgradePlane.on(Laya.Event.CLICK, this, this.closeUpgradeNode)
            })
        }
    }
    //关闭升级面板
    closeUpgradeNode() {
        this.closeUpgradePlane.off(Laya.Event.CLICK, this, this.closeUpgradeNode)
        Utility.tMove2D(this.moveNode, 0, this.moveNode.y, 200, () => {
            this.upgradeNode.visible = false
        })
    }

    //皮肤按钮回调
    skinBtnCB() {
        console.log('点击皮肤按钮')
        WxApi.aldEvent('皮肤界面：点击')
        Laya.Scene.open('MyScenes/SkinUI.scene', false, () => { })
    }

    //升级人数
    upgradePlayerCountCB() {
        console.log('点击升级人数')
        if (PlayerDataMgr.getPlayerCountLv() >= 5) {
            return
        }
        if (PlayerDataMgr.getPlayerData().coin < PlayerDataMgr.getUpgradePlayerCountLvCost()) {
            WxApi.OpenAlert('金币不足！')
            return
        }
        WxApi.aldEvent('升级界面：人数')
        PlayerDataMgr.changeCoin(-PlayerDataMgr.getUpgradePlayerCountLvCost())
        PlayerDataMgr.upgradePlayerCountLv()
        this.updatePlayerItem()
        GameLogic.Share.upgradePlayerCount()
        GameTopNode.Share.initData()
    }
    //升级攻击力
    upgradePlayerAtkCB() {
        console.log('点击升级攻击力')
        if (PlayerDataMgr.getPlayerPowerLv() >= 35) {
            return
        }
        if (PlayerDataMgr.getPlayerData().coin < PlayerDataMgr.getUpgradePlayerPowerLvCost()) {
            WxApi.OpenAlert('金币不足！')
            return
        }

        WxApi.aldEvent('升级界面：攻击力')
        PlayerDataMgr.changeCoin(-PlayerDataMgr.getUpgradePlayerPowerLvCost())
        PlayerDataMgr.upgradePlayerPowerLv()
        this.updatePlayerItem()
        GameTopNode.Share.initData()
    }
    //升级离线收益
    upgradeOfflineCB() {
        console.log('点击升级离线收益')
        if (PlayerDataMgr.getPlayerOfflineLv() >= 56) {
            return
        }
        if (PlayerDataMgr.getPlayerData().coin < PlayerDataMgr.getUpgradeOfflineLvCost()) {
            WxApi.OpenAlert('金币不足！')
            return
        }

        WxApi.aldEvent('升级界面：离线收益')
        PlayerDataMgr.changeCoin(-PlayerDataMgr.getUpgradeOfflineLvCost())
        PlayerDataMgr.upgradePlayerOfflineLv()
        this.updatePlayerItem()
        GameTopNode.Share.initData()
    }

    //复活按钮
    visibleOverNode(visible: boolean) {
        if (visible)
            WxApi.aldEvent('复活战士按钮弹出展示')
        this.touchPanel.visible = !visible
        this.overNode.visible = visible
        this.upgradeBtn.visible = !visible
        this.skinBtn.visible = !visible
    }
    reviveBtnCB() {
        GameLogic.Share.revivePlayer()
        this.visibleOverNode(false)
        // WxApi.aldEvent('复活战士：点击')
        // let cb: Function = () => {
        //     WxApi.aldEvent('复活战士：成功')
        //     this.visibleOverNode(false)
        //     GameLogic.Share.revivePlayer()
        // }
        // ShareMgr.instance.shareGame(cb)
    }
    startCB() {
        this.visibleOverNode(false)
        GameLogic.Share.goAhead()
    }

    visibleBottomUI(visible: boolean) {
        this.touchPanel.visible = visible
        this.upgradeBtn.visible = visible
        this.skinBtn.visible = visible
        // this.moreGameBtn.visible = visible
        // this.drawGameBtn.visible = visible

        if (visible)
            AdMgr.instance.hideBanner()
        else {
            //AdMgr.instance.hideBanner()
            AdMgr.instance.showBanner()
            // if (GameLogic.Share.showBottomBanner) {
            //     AdMgr.instance.showBanner()
            // } else {
            //     GameLogic.Share.showBottomBanner = true
            // }
        }
    }

    closeAppCB() {
        AdMgr.instance.closeAppBox()
        Laya.timer.clear(this, this.closeAppCB)
        this['gameOverBtnNode'].visible = true
        WxApi.fixBtnTouchPos(this.giveUpBtn, 320, 132, this)
    }

    visibleGameOverNode(visible: boolean) {
        if (visible && !this.gameOverNode.visible) {
            //AdMgr.instance.showBanner()
            AdMgr.instance.hideBanner()
            this['bounesCoin'].visible = GameLogic.Share.gotKillBossBounes

            if (JJMgr.instance.dataConfig.front_box_ads) {
                this['gameOverBtnNode'].visible = false
                AdMgr.instance.showAppBox(() => {
                    AdMgr.instance.closeAppBox()
                    Laya.timer.clear(this, this.closeAppCB)
                    this['gameOverBtnNode'].visible = true
                    WxApi.fixBtnTouchPos(this.giveUpBtn, 320, 132, this)
                })
                Laya.timer.once(7000, this, this.closeAppCB)
            } else {
                WxApi.fixBtnTouchPos(this.giveUpBtn, 320, 132, this)
            }

            if (GameLogic.Share.gotKillBossBounes) {
                GameLogic.Share.gotKillBossBounes = false
                let c = Utility.GetRandom(30, 100)
                this['bounesCoin'].text = '成功领取' + c + '金币'
                Utility.tMove2D(this['bounesCoin'], this['bounesCoin'].x, this['bounesCoin'].y - 100, 2000, () => { this['bounesCoin'].visible = false })
                PlayerDataMgr.changeCoin(c)
            }
        } else if (!visible) {
            this.moreGameBtn.visible = true
            AdMgr.instance.hideBanner()
        }
        this.gameOverNode.visible = visible
    }

    helpBtnCB() {
        WxApi.aldEvent('请求帮助：点击')
        let cb: Function = () => {
            WxApi.aldEvent('请求帮助：成功')
            this.visibleGameOverNode(false)
            GameLogic.Share.isOver = false
            GameLogic.Share.isHelpStart = true
            GameLogic.Share.tempPlayerCount = 1
            GameLogic.Share.restartGame()
        }
        ShareMgr.instance.shareGame(cb)
    }
    giveUpBtnCB() {
        WxApi.aldEvent('第' + PlayerDataMgr.getPlayerData().grade + '关：失败')
        GameLogic.Share.isHelpStart = false
        GameLogic.Share.gradeIndex = 0
        PlayerDataMgr.getPlayerData().gradeIndex = 0
        PlayerDataMgr.setPlayerData()
        this.visibleGameOverNode(false)
        GameLogic.Share.restartGame()
        if (JJMgr.instance.dataConfig.front_box_ads)
            AdMgr.instance.showAppBox()
    }

    createHpBar(node: Laya.Sprite3D) {
        let bar = PrefabManager.instance().getItem(PrefabItem.HpBar) as Laya.ProgressBar
        this.playerHp.addChild(bar)
        let crl = bar.addComponent(FixPlayerHpBar) as FixPlayerHpBar
        crl.initData(node)
    }

    createSmile(node: Laya.Sprite3D) {
        let smlie = PrefabManager.instance().getItem(PrefabItem.Smile) as Laya.Image
        this.addChild(smlie)
        let crl = smlie.getComponent(FixAiTips) as FixAiTips
        crl.initData(node)
    }
    createCry(node: Laya.Sprite3D) {
        let cry = PrefabManager.instance().getItem(PrefabItem.Cry) as Laya.Image
        this.addChild(cry)
        let crl = cry.getComponent(FixAiTips) as FixAiTips
        crl.initData(node)
    }

    getPowerBtnCB() {
        WxApi.aldEvent('获得体力：点击')
        let cb: Function = () => {
            WxApi.aldEvent('获得体力：成功')
            PlayerDataMgr.getPlayerData().power += 5
            PlayerDataMgr.setPlayerData()
        }
        ShareMgr.instance.shareGame(cb)
    }
    checkIsNoPower() {
        if (PlayerDataMgr.getPlayerData().gradeIndex == 0 && !GameLogic.Share.gameStarted && !GameLogic.Share.isHelpStart) {
            let p = PlayerDataMgr.getPlayerData().power
            this.touchPanel.visible = p > 0
            this.touchNode.visible = p > 0
            this.noPowerNode.visible = p <= 0
        }
    }

    createCoinBoom(node: Laya.Sprite3D) {
        let op: Laya.Vector4 = new Laya.Vector4(0, 0, 0)
        let hPos = node.transform.position.clone()
        hPos.y += 1.75
        GameLogic.Share._camera.viewport.project(hPos, GameLogic.Share._camera.projectionViewMatrix, op)
        let pos = new Laya.Vector2(op.x / Laya.stage.clientScaleX, op.y / Laya.stage.clientScaleY)
        let desPos = new Laya.Vector2(75, 100)

        Utility.coinCollectAnim(pos, desPos, this)
        GameTopNode.Share.initData()
    }

    getBounesBtnCB() {
        WxApi.closePacketUICB = () => {
            GameLogic.Share.pauseGame = false
        }
        GameLogic.Share.pauseGame = true
        Laya.Scene.open('MyScenes/OpenPacketsUI.scene', false)
    }
}