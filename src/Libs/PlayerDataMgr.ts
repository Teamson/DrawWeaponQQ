import Utility from "../Mod/Utility"

export class PacketData {
    state: number = 0
    curStateCash: number = 2
    curCash: number = 0
    videoCount: number = 0
}

export class PlayerData {
    grade: number = 1
    gradeIndex: number = 0
    power: number = 10
    playerCountLv: number = 1
    playerPowerLv: number = 1
    playerOfflineLv: number = 1
    coin: number = 0
    playerId: number = 0
    playerArr: number[] = []
    unlockSkinCount: number = 0
    exitTime: number = 0
}

export default class PlayerDataMgr {
    private static _playerData: PlayerData = null
    public static tempSkinId: number = -1
    public static aiConfig: any = null
    public static posConfig: any = null
    public static freeSkinId: number = -1

    public static skinArr1: number[] = [0, 1, 2, 8, 9] //金币
    public static skinArr2: number[] = [3, 4]    //视频
    public static skinArr3: number[] = [5, 6, 7] //宝箱
    public static skinArr4: number[] = [8, 9]    //签到

    public static _packetData: PacketData = null

    public static getPacketData(): PacketData {
        if (!localStorage.getItem('packetData')) {
            this._packetData = new PacketData()
            localStorage.setItem('packetData', JSON.stringify(this._packetData))
        } else {
            if (this._packetData == null) {
                this._packetData = JSON.parse(localStorage.getItem('packetData')) as PacketData
            }
        }
        return this._packetData
    }
    public static setPacketData() {
        localStorage.setItem('packetData', JSON.stringify(this._packetData))
    }

    //获取用户数据
    public static getPlayerData(): PlayerData {
        if (!localStorage.getItem('playerData')) {
            this._playerData = new PlayerData()
            for (let i = 0; i < 27; i++) {
                if (i == 0) {
                    this._playerData.playerArr.push(0)
                }
                else {
                    this._playerData.playerArr.push(-1)
                }
            }
            localStorage.setItem('playerData', JSON.stringify(this._playerData))
        } else {
            if (this._playerData == null) {
                this._playerData = JSON.parse(localStorage.getItem('playerData')) as PlayerData
            }
        }
        return this._playerData
    }

    //设置用户数据
    public static setPlayerData() {
        localStorage.setItem('playerData', JSON.stringify(this._playerData))
    }

    //获取未有的皮肤
    public static getPlayerYet(): number[] {
        let arr: number[] = []
        for (let i = 0; i < this._playerData.playerArr.length; i++) {
            if (this._playerData.playerArr[i] < 0) {
                arr.push(i)
            }
        }
        return arr
    }

    //获取金币皮肤
    public static getCoinSkins() {
        let idArr = [].concat(this.skinArr1)
        let arr = []
        for (let i = 0; i < idArr.length; i++) {
            if (this._playerData.playerArr[i] < 0) {
                arr.push(idArr[i])
            }
        }
        return arr
    }

    //获取视频皮肤
    public static getVideoSkins() {
        let idArr = [].concat(this.skinArr2)
        let arr = []
        for (let i = 0; i < idArr.length; i++) {
            if (this._playerData.playerArr[i + 9] < 0) {
                arr.push(idArr[i])
            }
        }
        return arr
    }

    //获取试用皮肤
    public static getFreeSkins() {
        let idArr: number[] = [].concat(this.skinArr1, this.skinArr2, this.skinArr3)
        idArr = Utility.shuffleArr(idArr)
        let arr = []
        for (let i = 0; i < idArr.length; i++) {
            let playerArrIndex = this.getPlayerArrIndexByValue(idArr[i])
            if (this._playerData.playerArr[playerArrIndex] < 0) {
                arr.push(idArr[i])
                if (arr.length >= 4) break
            }
        }
        return arr
    }

    //获取宝箱皮肤
    public static getBoxSkins() {
        let idArr = [].concat(this.skinArr3)
        let arr = []
        for (let i = 0; i < idArr.length; i++) {
            if (this._playerData.playerArr[i + 18] < 0) {
                arr.push(idArr[i])
            }
        }
        return arr
    }

    public static changeCoin(dt: number) {
        this._playerData.coin += dt
        this.setPlayerData()
    }

    public static getPlayerSkin(id: number, value: number) {
        this._playerData.playerArr[id] = value
        this._playerData.playerId = value
        this.setPlayerData()
    }

    //获取角色数量等级
    public static getPlayerCountLv() {
        return this._playerData.playerCountLv
    }
    //升级角色数量
    public static upgradePlayerCountLv() {
        if (this._playerData.playerCountLv >= 5) {
            return
        }
        this._playerData.playerCountLv += 1
        this.setPlayerData()
    }
    //获取角色数量
    public static getPlayerCount() {
        return this._playerData.playerCountLv
    }
    public static getCountLvMax() {
        return this._playerData.playerCountLv >= 5
    }

    //获取战斗力等级
    public static getPlayerPowerLv() {
        return this._playerData.playerPowerLv
    }
    //升级角色战斗力等级
    public static upgradePlayerPowerLv() {
        if (this._playerData.playerPowerLv >= 35) {
            return
        }
        this._playerData.playerPowerLv += 1
        this.setPlayerData()
    }
    //获取角色战斗力数据
    public static getPlayerPowerData() {
        let data: any = {
            hp: 125,
            atk: 20
        }

        data.hp = 125 + 4 * (this._playerData.playerPowerLv - 1)
        data.atk = 20 + 2 * (this._playerData.playerPowerLv - 1)

        return data
    }
    public static getPowerLvMax() {
        return this._playerData.playerPowerLv >= 35
    }

    //获取离线收益等级
    public static getPlayerOfflineLv() {
        return this._playerData.playerOfflineLv
    }
    //升级离线收益等级
    public static upgradePlayerOfflineLv() {
        if (this._playerData.playerOfflineLv >= 56) {
            return
        }
        this._playerData.playerOfflineLv += 1
        this.setPlayerData()
    }
    //获取离线收益数据
    public static getPlayerOffline(min: number) {
        return Math.floor(min * (1 + 0.05 * (this._playerData.playerOfflineLv - 1)))
    }
    public static getOfflineLvMax() {
        return this._playerData.playerOfflineLv >= 56
    }

    //获取NPC属性数据
    public static getNpcData(): any {
        let data: any = {
            hp: 100,
            atk: 10
        }

        let g = Math.floor((this._playerData.grade - 1) / 5) + 1
        data.hp = 100 + 10 * (g - 1)
        data.atk = 10 + 5 * (g - 1)

        if (data.hp > 240) {
            data.hp = 240
        }
        if (data.atk > 90) {
            data.atk = 90
        }
        return data
    }

    //获取升级角色数量等级的花费
    public static getUpgradePlayerCountLvCost() {
        let cost: number = 100
        let lv: number = this.getPlayerCountLv()
        cost = 100 + 500 * (lv - 1)
        return cost
    }

    //获取升级角色战斗力等级的花费
    public static getUpgradePlayerPowerLvCost() {
        let cost: number = 50
        let lv: number = this.getPlayerPowerLv()
        cost = 50 + 50 * (lv - 1)
        return cost
    }

    //获取升级离线收益等级的花费
    public static getUpgradeOfflineLvCost() {
        let cost: number = 50
        let lv: number = this.getPlayerOfflineLv()
        cost = 50 + 50 * (lv - 1)
        return cost
    }


    //获取金币解锁皮肤的价格
    public static getUnlockSkinCost() {
        return 100 + (100 * this._playerData.unlockSkinCount)
    }

    public static getHeroSkinDir(id: number): string {
        return 'heroSkins/Hero_' + (id + 1) + '.png'
    }

    public static setExitTime() {
        this._playerData.exitTime = new Date().getTime()
        this.setPlayerData()
    }

    public static getPlayerArrIndexByValue(value: number) {
        for (let i = 0; i < this.skinArr1.length; i++) {
            if (this.skinArr1.indexOf(value) != -1) {
                return this.skinArr1.indexOf(value)
            }
        }
        for (let i = 0; i < this.skinArr2.length; i++) {
            if (this.skinArr2.indexOf(value) != -1) {
                return this.skinArr2.indexOf(value) + 9
            }
        }
        for (let i = 0; i < this.skinArr3.length; i++) {
            if (this.skinArr3.indexOf(value) != -1) {
                return this.skinArr3.indexOf(value) + 18
            }
        }

        return -1
    }

}