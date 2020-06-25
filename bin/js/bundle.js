(function () {
    'use strict';

    class Utility {
        static calcDistance(a, b) {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        }
        static getDirectionAToB(A, B, normalize = true) {
            let pA = A.transform.position.clone();
            let pB = B.transform.position.clone();
            let dir = new Laya.Vector3(0, 0, 0);
            Laya.Vector3.subtract(pB, pA, dir);
            if (normalize)
                Laya.Vector3.normalize(dir, dir);
            return dir;
        }
        static fixPosY(y, designHeight = 1334) {
            return y * Laya.stage.displayHeight / designHeight;
        }
        static findNodeByName(rootNode, name) {
            let targetNode = null;
            let funC = (node) => {
                for (let i = 0; i < node.numChildren; i++) {
                    if (node.getChildAt(i).name == name) {
                        targetNode = node.getChildAt(i);
                        return;
                    }
                    else {
                        funC(node.getChildAt(i));
                    }
                }
            };
            funC(rootNode);
            return targetNode;
        }
        static TmoveTo(node, duration, des, cb, ease) {
            let t = new Laya.Tween();
            var posOld = node.transform.position;
            t.to(node.transform.position, {
                x: des.x,
                y: des.y,
                z: des.z,
                update: new Laya.Handler(this, () => {
                    node.transform.position = posOld;
                })
            }, duration, ease ? ease : Laya.Ease.cubicOut, Laya.Handler.create(this, () => {
                cb && cb();
            }));
        }
        static RotateTo(node, duration, des, cb) {
            var rotationOld = node.transform.localRotationEuler;
            Laya.Tween.to(node.transform.localRotationEuler, {
                x: des.x,
                y: des.y,
                z: des.z,
                update: new Laya.Handler(this, function () {
                    if (node)
                        node.transform.localRotationEuler = rotationOld;
                })
            }, duration, Laya.Ease.cubicOut, Laya.Handler.create(this, function () {
                cb && cb();
            }));
        }
        static tMove2D(node, x, y, t, cb) {
            Laya.Tween.to(node, { x: x, y: y }, t, null, new Laya.Handler(this, () => {
                if (cb)
                    cb();
            }));
        }
        static updateNumber(baseNum, times, label, labelOrFont = true, inclease, cb) {
            let timesNum = baseNum * times;
            let dt = Math.floor((timesNum - baseNum) / 60);
            dt = dt <= 0 ? 1 : dt;
            let func = () => {
                if (inclease) {
                    baseNum += dt;
                    if (baseNum >= timesNum) {
                        baseNum = timesNum;
                        cb && cb();
                        Laya.timer.clear(this, func);
                    }
                    if (labelOrFont)
                        label.text = baseNum.toString();
                    else
                        label.value = baseNum.toString();
                }
                else {
                    timesNum -= dt;
                    if (timesNum <= baseNum) {
                        timesNum = baseNum;
                        cb && cb();
                        Laya.timer.clear(this, func);
                    }
                    if (labelOrFont)
                        label.text = timesNum.toString();
                    else
                        label.value = timesNum.toString();
                }
            };
            Laya.timer.frameLoop(1, this, func);
        }
        static loadJson(str, complete) {
            Laya.loader.load(str, Laya.Handler.create(this, complete), null, Laya.Loader.JSON);
        }
        static objectShake(target, shakeTime = 1, shakeAmount = 0.7) {
            var shake = shakeTime;
            var decreaseFactor = 1;
            var originalPos = target.transform.localPosition.clone();
            Laya.timer.frameLoop(1, this, updateShake);
            function randomPos() {
                var x = Math.random() > 0.5 ? Math.random() : -(Math.random());
                var y = Math.random() > 0.5 ? Math.random() : -(Math.random());
                return new Laya.Vector3(x, y, 0);
            }
            function updateShake() {
                if (shake > 0) {
                    var pos = new Laya.Vector3();
                    Laya.Vector3.scale(randomPos(), shakeAmount, pos);
                    Laya.Vector3.add(originalPos, pos, pos);
                    target.transform.localPosition = pos;
                    shake -= 0.02 * decreaseFactor;
                }
                else {
                    shake = 0;
                    target.transform.localPosition = originalPos;
                    Laya.timer.clear(this, updateShake);
                }
            }
        }
        static getRandomItemInArr(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }
        static shuffleArr(arr) {
            let i = arr.length;
            while (i) {
                let j = Math.floor(Math.random() * i--);
                [arr[j], arr[i]] = [arr[i], arr[j]];
            }
            return arr;
        }
        static GetRandom(mix, max, isInt = true) {
            let w = max - mix;
            let r1 = Math.random() * w;
            r1 += mix;
            return isInt ? Math.floor(r1) : r1;
        }
        static coinCollectAnim(startPos, endPos, parent, amount = 10, callBack) {
            let am = amount;
            for (var i = 0; i < amount; i++) {
                let coin = Laya.Pool.getItemByClass("coin", Laya.Image);
                coin.skin = "mainUI/sy-jb.png";
                coin.x = startPos.x;
                coin.y = startPos.y;
                parent.addChild(coin);
                let time = 300 + Math.random() * 100 - 50;
                Laya.Tween.to(coin, { x: coin.x + Math.random() * 250 - 125, y: coin.y + Math.random() * 250 - 125 }, time);
                Laya.timer.once(time + 50, this, function () {
                    Laya.Tween.to(coin, { x: endPos.x, y: endPos.y }, 400, null, new Laya.Handler(this, function () {
                        parent.removeChild(coin);
                        Laya.Pool.recover("coin", coin);
                        am--;
                        if (am == 0 && callBack)
                            callBack();
                    }));
                });
            }
        }
        static scaleLoop(node, rate, t) {
            var tw = Laya.Tween.to(node, { scaleX: rate, scaleY: rate }, t, null, new Laya.Handler(this, () => {
                Laya.Tween.to(node, { scaleX: 1, scaleY: 1 }, t, null, new Laya.Handler(this, () => {
                    this.scaleLoop(node, rate, t);
                }));
            }));
        }
        static rotateLoop(node, rate, t) {
            var tw = Laya.Tween.to(node, { rotation: rate }, t, null, new Laya.Handler(this, () => {
                Laya.Tween.to(node, { rotation: -rate }, 2 * t, null, new Laya.Handler(this, () => {
                    Laya.Tween.to(node, { rotation: 0 }, t, null, new Laya.Handler(this, () => {
                        this.rotateLoop(node, rate, t);
                    }));
                }));
            }));
        }
        static visibleDelay(node, duration) {
            node.visible = false;
            Laya.timer.once(duration, this, () => { node.visible = true; });
        }
    }

    class PacketData {
        constructor() {
            this.state = 0;
            this.curStateCash = 2;
            this.curCash = 0;
            this.videoCount = 0;
        }
    }
    class PlayerData {
        constructor() {
            this.grade = 1;
            this.gradeIndex = 0;
            this.power = 10;
            this.playerCountLv = 1;
            this.playerPowerLv = 1;
            this.playerOfflineLv = 1;
            this.coin = 0;
            this.playerId = 0;
            this.playerArr = [];
            this.unlockSkinCount = 0;
            this.exitTime = 0;
        }
    }
    class PlayerDataMgr {
        static getPacketData() {
            if (!localStorage.getItem('packetData')) {
                this._packetData = new PacketData();
                localStorage.setItem('packetData', JSON.stringify(this._packetData));
            }
            else {
                if (this._packetData == null) {
                    this._packetData = JSON.parse(localStorage.getItem('packetData'));
                }
            }
            return this._packetData;
        }
        static setPacketData() {
            localStorage.setItem('packetData', JSON.stringify(this._packetData));
        }
        static getPlayerData() {
            if (!localStorage.getItem('playerData')) {
                this._playerData = new PlayerData();
                for (let i = 0; i < 27; i++) {
                    if (i == 0) {
                        this._playerData.playerArr.push(0);
                    }
                    else {
                        this._playerData.playerArr.push(-1);
                    }
                }
                localStorage.setItem('playerData', JSON.stringify(this._playerData));
            }
            else {
                if (this._playerData == null) {
                    this._playerData = JSON.parse(localStorage.getItem('playerData'));
                }
            }
            return this._playerData;
        }
        static setPlayerData() {
            localStorage.setItem('playerData', JSON.stringify(this._playerData));
        }
        static getPlayerYet() {
            let arr = [];
            for (let i = 0; i < this._playerData.playerArr.length; i++) {
                if (this._playerData.playerArr[i] < 0) {
                    arr.push(i);
                }
            }
            return arr;
        }
        static getCoinSkins() {
            let idArr = [].concat(this.skinArr1);
            let arr = [];
            for (let i = 0; i < idArr.length; i++) {
                if (this._playerData.playerArr[i] < 0) {
                    arr.push(idArr[i]);
                }
            }
            return arr;
        }
        static getVideoSkins() {
            let idArr = [].concat(this.skinArr2);
            let arr = [];
            for (let i = 0; i < idArr.length; i++) {
                if (this._playerData.playerArr[i + 9] < 0) {
                    arr.push(idArr[i]);
                }
            }
            return arr;
        }
        static getFreeSkins() {
            let idArr = [].concat(this.skinArr1, this.skinArr2, this.skinArr3);
            idArr = Utility.shuffleArr(idArr);
            let arr = [];
            for (let i = 0; i < idArr.length; i++) {
                let playerArrIndex = this.getPlayerArrIndexByValue(idArr[i]);
                if (this._playerData.playerArr[playerArrIndex] < 0) {
                    arr.push(idArr[i]);
                    if (arr.length >= 4)
                        break;
                }
            }
            return arr;
        }
        static getBoxSkins() {
            let idArr = [].concat(this.skinArr3);
            let arr = [];
            for (let i = 0; i < idArr.length; i++) {
                if (this._playerData.playerArr[i + 18] < 0) {
                    arr.push(idArr[i]);
                }
            }
            return arr;
        }
        static changeCoin(dt) {
            this._playerData.coin += dt;
            this.setPlayerData();
        }
        static getPlayerSkin(id, value) {
            this._playerData.playerArr[id] = value;
            this._playerData.playerId = value;
            this.setPlayerData();
        }
        static getPlayerCountLv() {
            return this._playerData.playerCountLv;
        }
        static upgradePlayerCountLv() {
            if (this._playerData.playerCountLv >= 5) {
                return;
            }
            this._playerData.playerCountLv += 1;
            this.setPlayerData();
        }
        static getPlayerCount() {
            return this._playerData.playerCountLv;
        }
        static getCountLvMax() {
            return this._playerData.playerCountLv >= 5;
        }
        static getPlayerPowerLv() {
            return this._playerData.playerPowerLv;
        }
        static upgradePlayerPowerLv() {
            if (this._playerData.playerPowerLv >= 35) {
                return;
            }
            this._playerData.playerPowerLv += 1;
            this.setPlayerData();
        }
        static getPlayerPowerData() {
            let data = {
                hp: 125,
                atk: 20
            };
            data.hp = 125 + 4 * (this._playerData.playerPowerLv - 1);
            data.atk = 20 + 2 * (this._playerData.playerPowerLv - 1);
            return data;
        }
        static getPowerLvMax() {
            return this._playerData.playerPowerLv >= 35;
        }
        static getPlayerOfflineLv() {
            return this._playerData.playerOfflineLv;
        }
        static upgradePlayerOfflineLv() {
            if (this._playerData.playerOfflineLv >= 56) {
                return;
            }
            this._playerData.playerOfflineLv += 1;
            this.setPlayerData();
        }
        static getPlayerOffline(min) {
            return Math.floor(min * (1 + 0.05 * (this._playerData.playerOfflineLv - 1)));
        }
        static getOfflineLvMax() {
            return this._playerData.playerOfflineLv >= 56;
        }
        static getNpcData() {
            let data = {
                hp: 100,
                atk: 10
            };
            let g = Math.floor((this._playerData.grade - 1) / 5) + 1;
            data.hp = 100 + 10 * (g - 1);
            data.atk = 10 + 5 * (g - 1);
            if (data.hp > 240) {
                data.hp = 240;
            }
            if (data.atk > 90) {
                data.atk = 90;
            }
            return data;
        }
        static getUpgradePlayerCountLvCost() {
            let cost = 100;
            let lv = this.getPlayerCountLv();
            cost = 100 + 500 * (lv - 1);
            return cost;
        }
        static getUpgradePlayerPowerLvCost() {
            let cost = 50;
            let lv = this.getPlayerPowerLv();
            cost = 50 + 50 * (lv - 1);
            return cost;
        }
        static getUpgradeOfflineLvCost() {
            let cost = 50;
            let lv = this.getPlayerOfflineLv();
            cost = 50 + 50 * (lv - 1);
            return cost;
        }
        static getUnlockSkinCost() {
            return 100 + (100 * this._playerData.unlockSkinCount);
        }
        static getHeroSkinDir(id) {
            return 'heroSkins/Hero_' + (id + 1) + '.png';
        }
        static setExitTime() {
            this._playerData.exitTime = new Date().getTime();
            this.setPlayerData();
        }
        static getPlayerArrIndexByValue(value) {
            for (let i = 0; i < this.skinArr1.length; i++) {
                if (this.skinArr1.indexOf(value) != -1) {
                    return this.skinArr1.indexOf(value);
                }
            }
            for (let i = 0; i < this.skinArr2.length; i++) {
                if (this.skinArr2.indexOf(value) != -1) {
                    return this.skinArr2.indexOf(value) + 9;
                }
            }
            for (let i = 0; i < this.skinArr3.length; i++) {
                if (this.skinArr3.indexOf(value) != -1) {
                    return this.skinArr3.indexOf(value) + 18;
                }
            }
            return -1;
        }
    }
    PlayerDataMgr._playerData = null;
    PlayerDataMgr.tempSkinId = -1;
    PlayerDataMgr.aiConfig = null;
    PlayerDataMgr.posConfig = null;
    PlayerDataMgr.freeSkinId = -1;
    PlayerDataMgr.skinArr1 = [0, 1, 2, 8, 9];
    PlayerDataMgr.skinArr2 = [3, 4];
    PlayerDataMgr.skinArr3 = [5, 6, 7];
    PlayerDataMgr.skinArr4 = [8, 9];
    PlayerDataMgr._packetData = null;

    class JJUtils {
        static httpRequest(url, params, type = 'get', completeHandler) {
            var xhr = new Laya.HttpRequest();
            xhr.http.timeout = 5000;
            xhr.once(Laya.Event.COMPLETE, this, completeHandler);
            xhr.once(Laya.Event.ERROR, this, this.httpRequest, [url, params, type, completeHandler]);
            if (type == "get") {
                xhr.send(url + '?' + params, "", type, "text");
            }
            else if (type == "post") {
                xhr.send(url, JSON.stringify(params), type, "text");
            }
        }
        static shuffleArr(arr) {
            let i = arr.length;
            while (i) {
                let j = Math.floor(Math.random() * i--);
                [arr[j], arr[i]] = [arr[i], arr[j]];
            }
            return arr;
        }
        static fixNodeY(node) {
            node.y = node.y * Laya.stage.displayHeight / Laya.stage.designHeight;
        }
        static visibleDelay(node, duration = 1500) {
            node.visible = false;
            Laya.timer.once(duration, this, () => {
                node.visible = true;
            });
        }
        static tMove(node, x, y, t, cb) {
            Laya.Tween.to(node, { x: x, y: y }, t, null, new Laya.Handler(this, () => {
                cb && cb();
            }));
        }
    }

    var SceneDir;
    (function (SceneDir) {
        SceneDir["SCENE_FRIENDGAME"] = "JJExport/FriendGameUI.scene";
        SceneDir["SCENE_SCROLLUI"] = "JJExport/ScrollUI.scene";
        SceneDir["SCENE_RECOMMENDUI"] = "JJExport/RecommendUI.scene";
        SceneDir["SCENE_FULLGAMEUI"] = "JJExport/FullGameUI.scene";
        SceneDir["SCENE_FINISHGAMEUI"] = "JJExport/FinishGameUI.scene";
        SceneDir["SCENE_DRAWUI"] = "JJExport/DrawUI.scene";
        SceneDir["SCENE_NEWGAMEUI"] = "JJExport/NewGameUI.scene";
        SceneDir["SCENE_PROGRAMUI"] = "JJExport/ProgramUI.scene";
    })(SceneDir || (SceneDir = {}));
    class JJMgr {
        constructor() {
            this.dataConfig = {
                allow_share: true,
                front_allow_return: true,
                front_banner_number: 8,
                front_banner_second: 800,
                front_button_second: 300,
                front_ckin_banner_move: 700,
                front_ckin_banner_second: 500,
                front_direct_draw: true,
                front_extra_share: false,
                front_home_screen_level: 10,
                front_home_screen_number: 5,
                front_lucky_screen_chance: 50,
                front_lucky_screen_level: 20,
                front_lucky_screen_number: 5,
                front_pass_gate: 10,
                front_proceed_game: 1000,
                front_proceed_history: 1,
                front_share_config: { image: "https://oss.99huyu.cn/wxhuyu/a1f98703efb3f3bfe2b9a4d5a250f926.png", title: "根据实际年纪看看你该在啥水平..." },
                front_share_number: 4,
                is_allow_area: 1
            };
            this.navDataArr = [];
            this.JJConfigUrl = 'https://jiujiu.99huyu.cn/qq/weapon/config.json';
            this.isFinished = false;
        }
        static get instance() {
            if (!this._instance) {
                this._instance = new JJMgr();
            }
            return this._instance;
        }
        canShowFullScreen(level) {
            return level >= this.dataConfig.front_auto_remen_level;
        }
        initJJ(version = '1.0.0', completeCB) {
            JJUtils.httpRequest(this.JJConfigUrl, 'version=' + version, 'get', (res) => {
                res = JSON.parse(res);
                console.log('JJ config.json:', res);
                this.dataConfig = res.data.config;
                this.isFinished = true;
                completeCB && completeCB();
            });
        }
        openScene(sceneDir, closeOther = false, param, parent) {
            Laya.Scene.open(sceneDir, closeOther, param, Laya.Handler.create(this, (v) => {
                if (parent)
                    parent.addChild(v);
            }));
        }
        closeScene(sceneDir) {
            Laya.Scene.close(sceneDir);
        }
        NavigateApp(index, cancelCB, successCB, from) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.qq.aldSendEvent('导出-总点击数');
                switch (from) {
                    case SceneDir.SCENE_DRAWUI:
                        Laya.Browser.window.qq.aldSendEvent('抽屉页面-总点击数');
                        break;
                    case SceneDir.SCENE_FINISHGAMEUI:
                        break;
                    case SceneDir.SCENE_FRIENDGAME:
                        Laya.Browser.window.qq.aldSendEvent('好友都在玩的爆款游戏弹-总点击数');
                        break;
                    case SceneDir.SCENE_FULLGAMEUI:
                        Laya.Browser.window.qq.aldSendEvent('全屏幕导出页-总点击数');
                        break;
                    case SceneDir.SCENE_RECOMMENDUI:
                        Laya.Browser.window.qq.aldSendEvent('热门推荐全屏幕导出页-总点击数');
                        break;
                    case SceneDir.SCENE_SCROLLUI:
                        break;
                    case SceneDir.SCENE_PROGRAMUI:
                        Laya.Browser.window.qq.aldSendEvent('游戏历史列表导出页-总点击数');
                        break;
                }
                Laya.Browser.window.qq.navigateToMiniProgram({
                    appId: this.navDataArr[index].appid,
                    path: this.navDataArr[index].path,
                    success: (res) => {
                        successCB && successCB();
                        Laya.Browser.window.qq.aldSendEvent('导出成功-总用户数');
                        Laya.Browser.window.qq.aldSendEvent('导出成功-' + this.navDataArr[index].title);
                        console.log('导出成功-' + this.navDataArr[index].title);
                        switch (from) {
                            case SceneDir.SCENE_DRAWUI:
                                Laya.Browser.window.qq.aldSendEvent('抽屉页面-总成功跳转数');
                                break;
                            case SceneDir.SCENE_FINISHGAMEUI:
                                break;
                            case SceneDir.SCENE_FRIENDGAME:
                                Laya.Browser.window.qq.aldSendEvent('好友都在玩的爆款游戏弹-总成功跳转数');
                                break;
                            case SceneDir.SCENE_FULLGAMEUI:
                                Laya.Browser.window.qq.aldSendEvent('全屏幕导出页-总成功跳转数');
                                break;
                            case SceneDir.SCENE_RECOMMENDUI:
                                Laya.Browser.window.qq.aldSendEvent('热门推荐全屏幕导出页-总成功跳转数');
                                break;
                            case SceneDir.SCENE_SCROLLUI:
                                break;
                            case SceneDir.SCENE_PROGRAMUI:
                                Laya.Browser.window.qq.aldSendEvent('游戏历史列表导出页-总成功跳转数');
                                break;
                        }
                    },
                    fail: (res) => {
                        cancelCB && cancelCB();
                    }
                });
            }
        }
        getTitle(index, sub = true) {
            if (sub) {
                if (this.navDataArr[index].subtitle && this.navDataArr[index].subtitle != '') {
                    return this.navDataArr[index].subtitle;
                }
                else {
                    return this.navDataArr[index].title;
                }
            }
            else {
                return this.navDataArr[index].title;
            }
        }
    }

    class SoundMgr {
        static get instance() {
            if (!this._instance) {
                this._instance = new SoundMgr();
            }
            return this._instance;
        }
        initLoading(fun) {
            var resUrl = [
                { url: 'res/sounds/bgm.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/castleHit1.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/castleHit2.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/castleHit3.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/die1.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/die2.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/getCoin.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponHit1.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponHit2.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponHit3.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponHit4.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/weaponReady.mp3', type: Laya.Loader.SOUND },
                { url: 'res/sounds/money.mp3', type: Laya.Loader.SOUND }
            ];
            Laya.loader.load(resUrl, Laya.Handler.create(this, fun));
            Laya.SoundManager.useAudioMusic = true;
            Laya.SoundManager.setMusicVolume(1);
        }
        playMusic(str, loops = 0, cb) {
            Laya.SoundManager.playMusic('res/sounds/' + str, loops, new Laya.Handler(this, cb));
        }
        stopMusic() {
            Laya.SoundManager.stopMusic();
        }
        playSoundEffect(str, loops = 1, cb) {
            Laya.SoundManager.playSound('res/sounds/' + str, loops, new Laya.Handler(this, cb));
        }
    }

    class ShareMgr {
        constructor() {
            this.path = '';
            this.picCount = 3;
            this.preT = 0;
            this.shareTips = [
                '请分享到活跃的群！',
                '请分享到不同群！',
                '请分享给好友！',
                '请分享给20人以上的群！'
            ];
        }
        static get instance() {
            if (!this._instance) {
                this._instance = new ShareMgr();
            }
            return this._instance;
        }
        initShare() {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.qq.showShareMenu({
                    withShareTicket: true,
                });
                let dir = JJMgr.instance.dataConfig.front_share_config.image;
                let content = JJMgr.instance.dataConfig.front_share_config.title;
                Laya.Browser.window.qq.onShareAppMessage(function (res) {
                    return {
                        title: content,
                        imageUrl: dir,
                    };
                });
                Laya.Browser.window.qq.onShow((para) => {
                    SoundMgr.instance.playMusic('bgm.mp3');
                    if (WxApi.shareCallback) {
                        let t = new Date().getTime();
                        let diff = t - WxApi.shareTime;
                        if (diff / 1000 >= 3 && !WxApi.firstShare) {
                            WxApi.shareCallback();
                            WxApi.front_share_number--;
                            Laya.Browser.window.qq.showToast({
                                title: '分享成功',
                                icon: 'none',
                                duration: 2000
                            });
                            WxApi.shareCallback = null;
                        }
                        else {
                            WxApi.firstShare = false;
                            Laya.Browser.window.qq.showModal({
                                title: '提示',
                                content: this.shareTips[Math.floor(Math.random() * this.shareTips.length)],
                                confirmText: '重新分享',
                                success(res) {
                                    if (res.confirm) {
                                        console.log('用户点击确定');
                                        ShareMgr.instance.shareGame(WxApi.shareCallback);
                                    }
                                    else if (res.cancel) {
                                        console.log('用户点击取消');
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
        shareGame(cb) {
            if (WxApi.front_share_number <= 0) {
                AdMgr.instance.showVideo(cb);
                return;
            }
            WxApi.shareCallback = cb;
            if (!Laya.Browser.onWeiXin) {
                cb();
                return;
            }
            WxApi.shareTime = new Date().getTime();
            let dir = JJMgr.instance.dataConfig.front_share_config.image;
            let content = JJMgr.instance.dataConfig.front_share_config.title;
            Laya.Browser.window.qq.shareAppMessage({
                title: content,
                imageUrl: dir
            });
        }
    }

    class AdMgr {
        constructor() {
            this.bannerUnitId = ['66e1008c167595adbc5450df9686edb8', 'cda95c4ef7ef0a6bfe3390e79c3f3069', '947d377267bea06eb446afe81328d792', '8a7c0bf18bb869abc182b7110fd70145',
                '0570d3493da45e35547e61e32ee19b38', '176025b6749a637515faaf04b0272d52', '98be607366cb4d45b017c141d3667bce'];
            this.videoUnitId = '32351da471a086273478425fb7f99aab';
            this.appBoxUnitId = 'e72c06906c7b12b06cfe70145816b8ed';
            this.bannerAd = null;
            this.videoAd = null;
            this.blockAd = null;
            this.videoCallback = null;
            this.curBannerId = 0;
            this.showBannerCount = 0;
            this.isBannerError = false;
            this.isLoaded = false;
            this.appBox = null;
            this.videoIsError = false;
            this.videoLoaded = false;
            this.isCreateBAD = false;
            this.appBoxCloseCB = null;
        }
        static get instance() {
            if (!this._instance) {
                this._instance = new AdMgr();
            }
            return this._instance;
        }
        initAd() {
            if (Laya.Browser.onWeiXin) {
                this.initBanner();
                this.initVideo();
                this.initAppBox();
            }
        }
        initAppBox(isShow = false) {
            if (Laya.Browser.onWeiXin) {
                let self = this;
                this.appBox = Laya.Browser.window.qq.createAppBox({
                    adUnitId: this.appBoxUnitId
                });
                this.appBox.load().then(() => {
                    if (isShow)
                        this.appBox.show();
                });
                this.appBox.offClose();
                this.appBox.onClose(() => {
                    if (self.appBoxCloseCB != null && self.appBoxCloseCB) {
                        self.appBoxCloseCB();
                    }
                    self.closeAppBox();
                });
            }
        }
        showAppBox(cb) {
            this.appBoxCloseCB = cb;
            if (Laya.Browser.onWeiXin && this.appBox) {
                this.appBox.show();
            }
            else if (Laya.Browser.onWeiXin && !this.appBox) {
                this.initAppBox(true);
            }
        }
        closeAppBox() {
            if (Laya.Browser.onWeiXin && this.appBox) {
                this.appBox.destroy();
                this.appBox = null;
                this.appBoxCloseCB = null;
            }
        }
        initBanner(isShow) {
            this.isLoaded = true;
            let winSize = Laya.Browser.window.qq.getSystemInfoSync();
            this.bannerAd = Laya.Browser.window.qq.createBannerAd({
                adUnitId: this.bannerUnitId[this.curBannerId],
                style: {
                    left: 0,
                    top: winSize.windowHeight,
                    width: 750,
                    height: 200
                }
            });
            this.bannerAd.onResize(res => {
                this.bannerAd.style.top = winSize.windowHeight - res.height;
                this.bannerAd.style.left = winSize.windowWidth / 2 - res.width / 2;
            });
            this.bannerAd.onError(res => {
                console.log('banner error:', JSON.stringify(res));
            });
            this.bannerAd.onLoad(() => {
                this.isLoaded = true;
                if (isShow)
                    this.showBanner();
            });
        }
        hideBanner() {
            let i = this.curBannerId;
            if (Laya.Browser.onWeiXin && this.bannerAd) {
                this.bannerAd.hide();
                if (JJMgr.instance.dataConfig != null && this.showBannerCount >= parseInt(JJMgr.instance.dataConfig.front_banner_number)) {
                    this.showBannerCount = 0;
                    this.curBannerId++;
                    if (this.curBannerId >= this.bannerUnitId.length) {
                        this.curBannerId = 0;
                    }
                    console.log('destroy banner');
                    this.destroyBanner();
                }
            }
        }
        showBanner() {
            let i = this.curBannerId;
            if (Laya.Browser.onWeiXin) {
                if (this.bannerAd && this.isLoaded) {
                    this.showBannerCount++;
                    this.bannerAd.show();
                }
                else {
                    this.initBanner(true);
                }
                console.log('showBanner :', this.showBannerCount);
            }
        }
        destroyBanner() {
            if (Laya.Browser.onWeiXin) {
                this.bannerAd.offResize();
                this.bannerAd.offLoad();
                this.bannerAd.offError();
                this.bannerAd.destroy();
                this.bannerAd = null;
            }
        }
        initVideo() {
            if (!Laya.Browser.onWeiXin) {
                return;
            }
            if (!this.videoAd) {
                this.videoAd = Laya.Browser.window.qq.createRewardedVideoAd({
                    adUnitId: this.videoUnitId
                });
            }
            this.loadVideo();
            this.videoAd.onLoad(() => {
                console.log('激励视频加载成功');
                this.videoLoaded = true;
            });
            this.videoAd.onError(res => {
                console.log('video Error:', JSON.stringify(res));
                this.videoIsError = true;
            });
        }
        loadVideo() {
            if (Laya.Browser.onWeiXin && this.videoAd != null) {
                this.videoIsError = false;
                this.videoAd.load();
            }
        }
        showVideo(cb) {
            this.videoCallback = cb;
            if (!Laya.Browser.onWeiXin) {
                this.videoCallback();
                return;
            }
            if (this.videoIsError) {
                ShareMgr.instance.shareGame(cb);
                this.loadVideo();
                return;
            }
            if (this.videoLoaded == false) {
                WxApi.OpenAlert('视频正在加载中！');
                return;
            }
            if (this.videoAd) {
                this.videoAd.offClose();
            }
            Laya.SoundManager.muted = true;
            this.videoAd.onClose((res) => {
                if (res && res.isEnded || res === undefined) {
                    console.log('正常播放结束，可以下发游戏奖励');
                    this.videoCallback();
                }
                else {
                    console.log('播放中途退出，不下发游戏奖励');
                }
                Laya.SoundManager.muted = false;
                AdMgr.instance.loadVideo();
            });
            this.videoAd.show();
        }
    }

    class WxApi {
        static LoginWx(cb) {
            if (!Laya.Browser.onWeiXin)
                return;
            let launchData = Laya.Browser.window.qq.getLaunchOptionsSync();
            Laya.Browser.window.qq.login({
                success(res) {
                    if (res.code) {
                        console.log('res.code:', res.code);
                        if (cb) {
                            cb(res.code, launchData.query);
                        }
                    }
                }
            });
        }
        static checkScope(btnNode) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.qq.getSetting({
                    success: (response) => {
                        if (!response.authSetting['scope.userInfo']) {
                            console.log('没有授权');
                            this.createScope(btnNode);
                        }
                        else {
                            console.log('已经授权');
                        }
                    }
                });
            }
        }
        static createScope(btnNode) {
            this.scopeBtn = Laya.Browser.window.qq.createUserInfoButton({
                type: 'text',
                text: '',
                style: {
                    left: btnNode.x,
                    top: btnNode.y,
                    width: btnNode.width,
                    height: btnNode.height,
                    lineHeight: 40,
                    backgroundColor: '#ffffff',
                    color: '#ffffff',
                    textAlign: 'center',
                    fontSize: 16,
                    borderRadius: 0
                }
            });
            this.scopeBtn.onTap((res) => {
                if (res.errMsg == "getUserInfo:ok") {
                    this.scopeBtn.destroy();
                    this.scopeBtn = null;
                }
                else if (res.errMsg == 'getUserInfo:fail auth deny') {
                    this.scopeBtn.destroy();
                    this.scopeBtn = null;
                }
            });
        }
        static GetLaunchParam(fun) {
            if (Laya.Browser.onWeiXin) {
                this.OnShowFun = fun;
                fun(this.GetLaunchPassVar());
                Laya.Browser.window.qq.onShow((para) => {
                    if (this.OnShowFun != null) {
                        this.OnShowFun(para);
                    }
                    console.log("wx on show");
                });
            }
        }
        static GetLaunchPassVar() {
            if (Laya.Browser.onWeiXin) {
                return Laya.Browser.window.qq.getLaunchOptionsSync();
            }
            else {
                return null;
            }
        }
        static WxOnHide(fun) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.qq.onHide(fun);
            }
        }
        static allowScene() {
            let s = JJMgr.instance.dataConfig.front_openwuchu_scene.toString();
            if (s.search('|') == -1) {
                let sInt = parseInt(s);
                return sInt == WxApi.sceneId;
            }
            let sArr = s.split('|');
            for (let i = 0; i < sArr.length; i++) {
                let sInt = parseInt(sArr[i]);
                if (sInt == WxApi.sceneId) {
                    return true;
                }
            }
            return false;
        }
        static allowPacketScene() {
            let s = JJMgr.instance.dataConfig.front_openredmoney_scene.toString();
            if (s.search('|') == -1) {
                let sInt = parseInt(s);
                return sInt == WxApi.sceneId;
            }
            let sArr = s.split('|');
            for (let i = 0; i < sArr.length; i++) {
                let sInt = parseInt(sArr[i]);
                if (sInt == WxApi.sceneId) {
                    return true;
                }
            }
            return false;
        }
        static httpRequest(url, params, type = 'get', completeHandler) {
            var xhr = new Laya.HttpRequest();
            xhr.http.timeout = 5000;
            xhr.once(Laya.Event.COMPLETE, this, completeHandler);
            xhr.once(Laya.Event.ERROR, this, this.httpRequest, [url, params, type, completeHandler]);
            if (type == "get") {
                xhr.send(url + '?' + params, "", type, "text");
            }
            else if (type == "post") {
                xhr.send(url, JSON.stringify(params), type, "text");
            }
        }
        static DoVibrate(isShort = true) {
            if (Laya.Browser.onWeiXin && this.isVibrate) {
                if (isShort) {
                    Laya.Browser.window.qq.vibrateShort();
                }
                else {
                    Laya.Browser.window.qq.vibrateLong();
                }
            }
        }
        static OpenAlert(msg, dur = 2000, icon = false) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.qq.showToast({
                    title: msg,
                    duration: dur,
                    mask: false,
                    icon: icon ? 'success' : 'none',
                });
            }
        }
        static NavigateApp(appid, path, title, cancelCB, successCB) {
            if (Laya.Browser.onWeiXin) {
                let self = this;
                Laya.Browser.window.qq.navigateToMiniProgram({
                    appId: appid,
                    path: path,
                    success(res) {
                        console.log('打开成功');
                        successCB();
                    },
                    fail(res) {
                        console.log('打开失败');
                        cancelCB();
                    }
                });
            }
        }
        static preViewImage(url) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.qq.previewImage({
                    current: url,
                    urls: [url]
                });
            }
        }
        static aldEvent(str) {
            return;
            if (Laya.Browser.onWeiXin)
                Laya.Browser.window.qq.aldSendEvent(str);
        }
        static fixBtnTouchPos(btn, startPosY, endPosY, target, cb) {
            if (WxApi.isValidBanner()) {
                btn.y = startPosY * Laya.stage.displayHeight / 1334;
                Laya.timer.once(1100, target, () => { AdMgr.instance.showBanner(); });
                Laya.timer.once(1350, target, () => {
                    btn.y = endPosY;
                    cb && cb();
                });
            }
            else {
                AdMgr.instance.showBanner();
                cb && cb();
            }
        }
        static isValidBanner(grade) {
            if (WxApi.isWhiteList) {
                if (grade) {
                    return grade >= JJMgr.instance.dataConfig.front_pass_gate && JJMgr.instance.dataConfig.is_allow_area == 1;
                }
                else {
                    return PlayerDataMgr.getPlayerData().grade >= JJMgr.instance.dataConfig.front_pass_gate && JJMgr.instance.dataConfig.is_allow_area == 1;
                }
            }
            else
                return false;
        }
        static isValidPacket(isFinish = false) {
            if (isFinish) {
                return WxApi.isPacketWhiteList && PlayerDataMgr.getPlayerData().grade - 1 >= JJMgr.instance.dataConfig.front_redmoney_gate &&
                    JJMgr.instance.dataConfig.front_redmoney_page;
            }
            else {
                return WxApi.isPacketWhiteList && PlayerDataMgr.getPlayerData().grade >= JJMgr.instance.dataConfig.front_redmoney_gate &&
                    JJMgr.instance.dataConfig.front_redmoney_page;
            }
        }
        static calculateShareNumber() {
            if (localStorage.getItem('lastDate')) {
                if (new Date().getDate() == parseInt(localStorage.getItem('lastDate'))) {
                    this.front_share_number = parseInt(localStorage.getItem('front_share_number'));
                }
                else {
                    this.front_share_number = JJMgr.instance.dataConfig.front_share_number;
                }
            }
            else {
                this.front_share_number = JJMgr.instance.dataConfig.front_share_number;
            }
            console.log('this.front_share_number:', this.front_share_number);
        }
    }
    WxApi.UnityPath = 'LayaScene_MyScene/Conventional/';
    WxApi.sceneId = 0;
    WxApi.isWhiteList = false;
    WxApi.isPacketWhiteList = false;
    WxApi.openId = '';
    WxApi.version = '1.0.5';
    WxApi.isVibrate = true;
    WxApi.isMusic = true;
    WxApi.OnShowFun = null;
    WxApi.scopeBtn = null;
    WxApi.shareCallback = null;
    WxApi.front_share_number = 0;
    WxApi.gotOfflineBounes = false;
    WxApi.configData = null;
    WxApi.shareTime = 0;
    WxApi.firstShare = true;
    WxApi.hadShowFriendUI = false;
    WxApi.launchGameUI = false;
    WxApi.firstStartGame = false;
    WxApi.isKillBossUI = false;
    WxApi.fromKillBossUI = false;
    WxApi.isShowAppBox = false;
    WxApi.closePacketUICB = null;
    WxApi.tempGrade = 1;

    class Boss extends Laya.Script {
        constructor() {
            super();
            this.myOwner = null;
            this._ani = null;
            this.isHited = false;
            this.isDied = false;
            this.hp = 100;
        }
        onAwake() {
            this.myOwner = this.owner;
            this._ani = this.owner.getComponent(Laya.Animator);
        }
        onDisable() {
        }
        playDied() {
            this._ani.speed = 1;
            this._ani.crossFade("Take 001", 0.05);
        }
        hitBack(atk) {
            if (this.isDied || this.isHited) {
                return;
            }
            let id = Utility.GetRandom(1, 3);
            SoundMgr.instance.playSoundEffect('castleHit' + id + '.mp3');
            WxApi.DoVibrate();
            Utility.objectShake(this.myOwner, 0.2, 0.1);
            this.hp -= atk;
            if (this.hp <= 0) {
                this.isDied = true;
                this.playDied();
                Laya.timer.once(1000, this, () => {
                    this.owner.destroy();
                });
                return;
            }
            this.isHited = true;
            Laya.timer.once(500, this, () => { this.isHited = false; });
        }
    }

    class TimeCountMgr {
        constructor() {
            this.tCount = 0;
            TimeCountMgr.Share = this;
            this.init();
        }
        init() {
            if (localStorage.getItem('powerTime')) {
                this.tCount = parseInt(localStorage.getItem('powerTime'));
            }
            else {
                localStorage.setItem('power', '0');
            }
            this.calculateExitTime();
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.qq.onShow((para) => {
                    this.calculateExitTime();
                });
                Laya.Browser.window.qq.onHide((para) => {
                    localStorage.setItem('powerTime', this.tCount.toString());
                    localStorage.setItem('exitTime', new Date().getTime().toString());
                });
            }
            Laya.timer.loop(1000, this, this.calculateTime);
        }
        calculateExitTime() {
            let exitTime = 0;
            if (localStorage.getItem('exitTime')) {
                exitTime = new Date().getTime() - parseInt(localStorage.getItem('exitTime'));
            }
            if (exitTime <= 0)
                return;
            exitTime /= 1000;
            let t = Math.floor(exitTime / 600);
            PlayerDataMgr.getPlayerData().power += t;
            if (PlayerDataMgr.getPlayerData().power > 10) {
                PlayerDataMgr.getPlayerData().power = 10;
                PlayerDataMgr.setPlayerData();
            }
        }
        calculateTime() {
            if (this.tCount <= 0) {
                if (PlayerDataMgr.getPlayerData().power < 10) {
                    this.tCount = 600;
                }
                else {
                    this.tCount = 0;
                }
                return;
            }
            this.tCount--;
            if (this.tCount <= 0) {
                if (PlayerDataMgr.getPlayerData().power < 10) {
                    PlayerDataMgr.getPlayerData().power += 1;
                    PlayerDataMgr.setPlayerData();
                    this.tCount = PlayerDataMgr.getPlayerData().power < 10 ? 600 : 0;
                }
            }
        }
    }

    class GameTopNode extends Laya.Script {
        constructor() {
            super();
        }
        onEnable() {
            GameTopNode.Share = this;
            this.calculateTime();
            Laya.timer.loop(1000, this, this.calculateTime);
            this.initData();
            this.txNode.getChildByName('txBtn').on(Laya.Event.CLICK, this, this.txBtnCB);
            Laya.timer.frameLoop(2, this, () => {
                this.txNode.getChildByName('curNum').text = PlayerDataMgr.getPacketData().curCash.toFixed(2) + '元';
            });
            this.txNode.visible = WxApi.isValidPacket();
        }
        txBtnCB() {
            WxApi.closePacketUICB = () => {
                GameLogic.Share.pauseGame = false;
            };
            GameLogic.Share.pauseGame = true;
            Laya.Scene.open('MyScenes/TakeCashUI.scene', false);
        }
        initData() {
            this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString();
            this.powerNum.value = PlayerDataMgr.getPlayerData().power.toString();
            this.gradeNum.text = PlayerDataMgr.getPlayerData().grade.toString();
            this.bar.width = (PlayerDataMgr.getPlayerData().gradeIndex + 1) / 4 * 480;
            this.bossPic.visible = this.bar.width >= 480;
            let g = Math.floor(PlayerDataMgr.getPlayerData().grade % 4) == 0 ? 4 : Math.floor(PlayerDataMgr.getPlayerData().grade % 4);
            for (let i = 0; i < this.keyNode.numChildren; i++) {
                let key = this.keyNode.getChildAt(i);
                key.skin = g > i + 1 ? 'mainUI/sy-ys1.png' : 'mainUI/sy-ys2.png';
            }
        }
        onDisable() {
            Laya.timer.clearAll(this);
        }
        onUpdate() {
            this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString();
        }
        calculateTime() {
            let t = TimeCountMgr.Share.tCount;
            let m = Math.floor(t / 60);
            let s = Math.floor(t - m * 60);
            this.powerTime.text = m.toString() + ':' + s.toString();
            this.powerNum.value = PlayerDataMgr.getPlayerData().power.toString();
            this.powerTime.visible = PlayerDataMgr.getPlayerData().power < 10;
        }
    }

    var PrefabItem;
    (function (PrefabItem) {
        PrefabItem["HpBar"] = "prefab/hpBar.prefab";
        PrefabItem["Smile"] = "prefab/smile.prefab";
        PrefabItem["Cry"] = "prefab/cry.prefab";
        PrefabItem["Coin"] = "prefab/coinEffect.prefab";
    })(PrefabItem || (PrefabItem = {}));
    class PrefabManager {
        constructor() {
            this.init();
            Laya.loader.load(this.url, Laya.Handler.create(this, this.loadComplete), Laya.Handler.create(this, this.loadProgress), Laya.Loader.PREFAB);
        }
        static instance() {
            return PrefabManager._instance ? PrefabManager._instance : PrefabManager._instance = new PrefabManager();
        }
        init() {
            this.url = [];
            for (let prefab in PrefabItem) {
                this.url.push(PrefabItem[prefab]);
            }
        }
        getItem(name) {
            let prefab = Laya.loader.getRes(name);
            if (prefab) {
                return Laya.Pool.getItemByCreateFun(name, prefab.create, prefab);
            }
            else
                return null;
        }
        recoverItem(name, item) {
            Laya.Pool.recover(name, item);
        }
        loadProgress(res) {
            console.log("预制体资源加载中...", res);
        }
        loadComplete() {
            console.log("预制体资源加载完成!");
        }
    }

    class FixPlayerHpBar extends Laya.Script {
        constructor() {
            super();
            this.playerNode = null;
            this.playerCrl = null;
            this.ready = false;
        }
        onAwake() {
            this.myOwner = this.owner;
        }
        onDisable() {
        }
        initData(node) {
            this.playerNode = node;
            this.ready = true;
            this.playerCrl = this.playerNode.getComponent(Player);
        }
        onUpdate() {
            if (!this.ready) {
                return;
            }
            if (this.playerNode.transform == null || this.playerNode.transform == undefined) {
                this.myOwner.destroy();
                return;
            }
            this.myOwner.value = this.playerCrl.hp / this.playerCrl.hpMax;
            let op = new Laya.Vector4(0, 0, 0);
            let hPos = this.playerNode.transform.position.clone();
            if (!this.playerCrl.isPlayer)
                hPos.y += 4;
            else
                hPos.z -= 1;
            GameLogic.Share._camera.viewport.project(hPos, GameLogic.Share._camera.projectionViewMatrix, op);
            this.myOwner.pos(op.x / Laya.stage.clientScaleX, op.y / Laya.stage.clientScaleY);
        }
    }

    class FixAiTips extends Laya.Script {
        constructor() {
            super();
            this.playerNode = null;
            this.playerCrl = null;
            this.ready = false;
        }
        onAwake() {
            this.myOwner = this.owner;
        }
        onDisable() {
        }
        initData(node) {
            this.playerNode = node;
            this.playerCrl = this.playerNode.getComponent(Player);
            this.ready = true;
            Laya.timer.once(2000, this, () => { this.myOwner.destroy(); });
        }
        onUpdate() {
            if (!this.ready) {
                return;
            }
            if (this.playerNode.transform == null || this.playerNode.transform == undefined) {
                this.myOwner.destroy();
                return;
            }
            let op = new Laya.Vector4(0, 0, 0);
            let hPos = this.playerNode.transform.position.clone();
            hPos.y += 3.5;
            GameLogic.Share._camera.viewport.project(hPos, GameLogic.Share._camera.projectionViewMatrix, op);
            this.myOwner.pos(op.x / Laya.stage.clientScaleX, op.y / Laya.stage.clientScaleY);
        }
    }

    class GameUI extends Laya.Scene {
        constructor() {
            super();
            this.touchPanel = this['touchPanel'];
            this.touchNode = this['touchNode'];
            this.drawSp = this['drawSp'];
            this.btnNode = this['btnNode'];
            this.noPowerNode = this['noPowerNode'];
            this.upgradeNode = this['upgradeNode'];
            this.closeUpgradePlane = this['closeUpgradePlane'];
            this.moveNode = this['moveNode'];
            this.item1 = this['item1'];
            this.item2 = this['item2'];
            this.item3 = this['item3'];
            this.getPowerBtn = this['getPowerBtn'];
            this.upgradeBtn = this['upgradeBtn'];
            this.skinBtn = this['skinBtn'];
            this.reviveBtn = this['reviveBtn'];
            this.startBtn = this['startBtn'];
            this.overNode = this['overNode'];
            this.bottomNode = this['bottomNode'];
            this.gameOverNode = this['gameOverNode'];
            this.helpBtn = this['helpBtn'];
            this.giveUpBtn = this['giveUpBtn'];
            this.gameOverBtnNode = this['gameOverBtnNode'];
            this.playerHp = this['playerHp'];
            this.aiHp = this['aiHp'];
            this.moreGameBtn = this['moreGameBtn'];
            this.getBounesBtn = this['getBounesBtn'];
            this.touchStarted = false;
            this.startPos = null;
            this.lineArr = [];
            this.lineArrVec2 = [];
        }
        onOpened(param) {
            GameUI.Share = this;
            this.initData();
            param && param();
            Laya.timer.frameLoop(1, this, this.checkIsNoPower);
            let showOL = false;
            if (!WxApi.launchGameUI) {
                WxApi.GetLaunchParam((p) => {
                    let et = PlayerDataMgr.getPlayerData().exitTime;
                    if (et > 0) {
                        let curT = new Date().getTime();
                        let diffT = Math.floor((curT - et) / 1000 / 60);
                        if (diffT >= 1) {
                            Laya.Scene.open('MyScenes/OfflineUI.scene', false, diffT);
                            showOL = true;
                        }
                    }
                });
                WxApi.launchGameUI = true;
                GameLogic.Share.checkCanUpgrade();
            }
            if (!showOL && localStorage.getItem('lastDate') && !WxApi.isShowAppBox && JJMgr.instance.dataConfig.front_box_ads) {
                WxApi.isShowAppBox = true;
                AdMgr.instance.showAppBox();
            }
            this['drawTips'].visible = PlayerDataMgr.getPlayerData().grade <= 2;
            this['drawTips'].skin = PlayerDataMgr.getPlayerData().grade == 1 ? 'mainUI/sy_ck2.png' : 'mainUI/sy_ck1.png';
            if (!localStorage.getItem('guide') && PlayerDataMgr.getPlayerData().grade == 1) {
                this['fingerAni'].visible = true;
            }
            else {
                this['fingerAni'].visible = false;
            }
            SoundMgr.instance.playMusic('bgm.mp3');
            if (!GameLogic.Share.isBanGameUIBanner) {
                AdMgr.instance.hideBanner();
            }
            else {
                GameLogic.Share.isBanGameUIBanner = false;
            }
        }
        onClosed() {
            Laya.timer.clearAll(this);
        }
        initData() {
            this.touchPanel.y = Utility.fixPosY(this.touchPanel.y);
            this.bottomNode.y = Utility.fixPosY(this.bottomNode.y);
            this.gameOverBtnNode.y = Utility.fixPosY(this.gameOverBtnNode.y);
            this.touchNode.on(Laya.Event.MOUSE_DOWN, this, this.touchStart);
            this.touchNode.on(Laya.Event.MOUSE_MOVE, this, this.touchMove);
            this.touchNode.on(Laya.Event.MOUSE_UP, this, this.touchEnd);
            this.touchNode.on(Laya.Event.MOUSE_OUT, this, this.touchOut);
            this.upgradeBtn.on(Laya.Event.CLICK, this, this.upgradeBtnCB);
            this.skinBtn.on(Laya.Event.CLICK, this, this.skinBtnCB);
            this.item1.on(Laya.Event.CLICK, this, this.upgradePlayerCountCB);
            this.item2.on(Laya.Event.CLICK, this, this.upgradePlayerAtkCB);
            this.item3.on(Laya.Event.CLICK, this, this.upgradeOfflineCB);
            this.reviveBtn.on(Laya.Event.CLICK, this, this.reviveBtnCB);
            this.startBtn.on(Laya.Event.CLICK, this, this.startCB);
            this.helpBtn.on(Laya.Event.CLICK, this, this.helpBtnCB);
            this.giveUpBtn.on(Laya.Event.CLICK, this, this.giveUpBtnCB);
            this.getPowerBtn.on(Laya.Event.CLICK, this, this.getPowerBtnCB);
            this.moreGameBtn.on(Laya.Event.CLICK, this, this.moreGameBtnCB);
            Utility.rotateLoop(this.moreGameBtn.getChildAt(0), 15, 100);
            this.getBounesBtn.on(Laya.Event.CLICK, this, this.getBounesBtnCB);
            Utility.rotateLoop(this.getBounesBtn.getChildAt(0), 15, 100);
            this.getBounesBtn.visible = WxApi.isValidPacket();
            this.updatePlayerItem();
            Laya.timer.loop(1000, this, this.updatePlayerItem);
            GameLogic.Share.canTouch = true;
        }
        moreGameBtnCB() {
            AdMgr.instance.showAppBox();
        }
        updatePlayerItem() {
            let item = null;
            let showTips = false;
            for (let i = 1; i <= 3; i++) {
                item = this['item' + i];
                let lvNum = item.getChildByName('lvNum');
                let cost = item.getChildByName('cost');
                let panel = item.getChildByName('panel');
                switch (i) {
                    case 1:
                        lvNum.text = '等级：' + PlayerDataMgr.getPlayerCountLv().toString();
                        cost.text = PlayerDataMgr.getUpgradePlayerCountLvCost().toString();
                        panel.visible = PlayerDataMgr.getUpgradePlayerCountLvCost() > PlayerDataMgr.getPlayerData().coin || PlayerDataMgr.getCountLvMax();
                        break;
                    case 2:
                        lvNum.text = '等级：' + PlayerDataMgr.getPlayerPowerLv().toString();
                        cost.text = PlayerDataMgr.getUpgradePlayerPowerLvCost().toString();
                        panel.visible = PlayerDataMgr.getUpgradePlayerPowerLvCost() > PlayerDataMgr.getPlayerData().coin || PlayerDataMgr.getPowerLvMax();
                        break;
                    case 3:
                        lvNum.text = '等级：' + PlayerDataMgr.getPlayerOfflineLv().toString();
                        cost.text = PlayerDataMgr.getUpgradeOfflineLvCost().toString();
                        panel.visible = PlayerDataMgr.getUpgradeOfflineLvCost() > PlayerDataMgr.getPlayerData().coin || PlayerDataMgr.getOfflineLvMax();
                        break;
                }
                if (!panel.visible) {
                    showTips = true;
                }
            }
            let tips = this.upgradeBtn.getChildAt(0);
            tips.visible = showTips;
        }
        touchStart(event) {
            if (!this.safeArea(new Laya.Vector2(event.stageX, event.stageY)) || !GameLogic.Share.canTouch) {
                return;
            }
            this['fingerAni'].visible = false;
            if (!localStorage.getItem('guide')) {
                localStorage.setItem('guide', '1');
            }
            if (PlayerDataMgr.getPlayerData().gradeIndex == 0 && !GameLogic.Share.gameStarted) {
                PlayerDataMgr.getPlayerData().power--;
                PlayerDataMgr.setPlayerData();
                GameLogic.Share.gameStarted = true;
            }
            this.touchStarted = true;
            this.startPos = new Laya.Vector2(event.stageX, event.stageY);
            this.lineArr = [];
            this.lineArr.push(this.startPos.x);
            this.lineArr.push(this.startPos.y);
            this.lineArrVec2 = [];
            this.lineArrVec2.push(this.startPos);
        }
        touchMove(event) {
            if (!this.safeArea(new Laya.Vector2(event.stageX, event.stageY)) || !this.touchStarted) {
                return;
            }
            let p = new Laya.Vector2(event.stageX, event.stageY);
            let dis = Utility.calcDistance(this.startPos, p);
            if (dis >= 10 && this.lineArrVec2.length < GameLogic.WEAPON_LENGTH_MAX) {
                this.lineArr.push(p.x);
                this.lineArr.push(p.y);
                this.lineArrVec2.push(p);
                this.startPos = p;
                this.drawLine();
            }
        }
        touchEnd(event) {
            if (!this.touchStarted) {
                return;
            }
            this.touchStarted = false;
            this.drawSp.graphics.clear();
            if (this.lineArrVec2.length < GameLogic.WEAPON_LENGTH_MIN) {
                WxApi.OpenAlert('武器太短啦，请重画！');
                return;
            }
            GameLogic.Share.createLine3D(this.lineArrVec2);
        }
        touchOut(event) {
            if (!this.touchStarted) {
                return;
            }
            this.touchStarted = false;
            this.drawSp.graphics.clear();
            if (this.lineArrVec2.length < GameLogic.WEAPON_LENGTH_MIN) {
                WxApi.OpenAlert('武器太短啦，请重画！');
                return;
            }
            GameLogic.Share.createLine3D(this.lineArrVec2);
        }
        drawLine() {
            this.drawSp.graphics.clear();
            this.drawSp.graphics.drawLines(0, 0, this.lineArr, "#000000", 8);
        }
        safeArea(pos) {
            let x1 = this.touchPanel.x - this.touchPanel.width / 2;
            let x2 = this.touchPanel.x + this.touchPanel.width / 2;
            let y1 = this.touchPanel.y - this.touchPanel.height / 2;
            let y2 = this.touchPanel.y + this.touchPanel.height / 2;
            if (pos.x < x1 || pos.x > x2 || pos.y < y1 || pos.y > y2) {
                return false;
            }
            else {
                return true;
            }
        }
        upgradeBtnCB() {
            if (this.upgradeNode.visible) {
                return;
            }
            else {
                WxApi.aldEvent('首页升级按钮：点击');
                this.upgradeNode.visible = true;
                Utility.tMove2D(this.moveNode, -606, this.moveNode.y, 200, () => {
                    this.closeUpgradePlane.off(Laya.Event.CLICK, this, this.closeUpgradeNode);
                    this.closeUpgradePlane.on(Laya.Event.CLICK, this, this.closeUpgradeNode);
                });
            }
        }
        closeUpgradeNode() {
            this.closeUpgradePlane.off(Laya.Event.CLICK, this, this.closeUpgradeNode);
            Utility.tMove2D(this.moveNode, 0, this.moveNode.y, 200, () => {
                this.upgradeNode.visible = false;
            });
        }
        skinBtnCB() {
            console.log('点击皮肤按钮');
            WxApi.aldEvent('皮肤界面：点击');
            Laya.Scene.open('MyScenes/SkinUI.scene', false, () => { });
        }
        upgradePlayerCountCB() {
            console.log('点击升级人数');
            if (PlayerDataMgr.getPlayerCountLv() >= 5) {
                return;
            }
            if (PlayerDataMgr.getPlayerData().coin < PlayerDataMgr.getUpgradePlayerCountLvCost()) {
                WxApi.OpenAlert('金币不足！');
                return;
            }
            WxApi.aldEvent('升级界面：人数');
            PlayerDataMgr.changeCoin(-PlayerDataMgr.getUpgradePlayerCountLvCost());
            PlayerDataMgr.upgradePlayerCountLv();
            this.updatePlayerItem();
            GameLogic.Share.upgradePlayerCount();
            GameTopNode.Share.initData();
        }
        upgradePlayerAtkCB() {
            console.log('点击升级攻击力');
            if (PlayerDataMgr.getPlayerPowerLv() >= 35) {
                return;
            }
            if (PlayerDataMgr.getPlayerData().coin < PlayerDataMgr.getUpgradePlayerPowerLvCost()) {
                WxApi.OpenAlert('金币不足！');
                return;
            }
            WxApi.aldEvent('升级界面：攻击力');
            PlayerDataMgr.changeCoin(-PlayerDataMgr.getUpgradePlayerPowerLvCost());
            PlayerDataMgr.upgradePlayerPowerLv();
            this.updatePlayerItem();
            GameTopNode.Share.initData();
        }
        upgradeOfflineCB() {
            console.log('点击升级离线收益');
            if (PlayerDataMgr.getPlayerOfflineLv() >= 56) {
                return;
            }
            if (PlayerDataMgr.getPlayerData().coin < PlayerDataMgr.getUpgradeOfflineLvCost()) {
                WxApi.OpenAlert('金币不足！');
                return;
            }
            WxApi.aldEvent('升级界面：离线收益');
            PlayerDataMgr.changeCoin(-PlayerDataMgr.getUpgradeOfflineLvCost());
            PlayerDataMgr.upgradePlayerOfflineLv();
            this.updatePlayerItem();
            GameTopNode.Share.initData();
        }
        visibleOverNode(visible) {
            if (visible)
                WxApi.aldEvent('复活战士按钮弹出展示');
            this.touchPanel.visible = !visible;
            this.overNode.visible = visible;
            this.upgradeBtn.visible = !visible;
            this.skinBtn.visible = !visible;
        }
        reviveBtnCB() {
            GameLogic.Share.revivePlayer();
            this.visibleOverNode(false);
        }
        startCB() {
            this.visibleOverNode(false);
            GameLogic.Share.goAhead();
        }
        visibleBottomUI(visible) {
            this.touchPanel.visible = visible;
            this.upgradeBtn.visible = visible;
            this.skinBtn.visible = visible;
            if (visible)
                AdMgr.instance.hideBanner();
            else {
                AdMgr.instance.showBanner();
            }
        }
        closeAppCB() {
            AdMgr.instance.closeAppBox();
            Laya.timer.clear(this, this.closeAppCB);
            this['gameOverBtnNode'].visible = true;
            WxApi.fixBtnTouchPos(this.giveUpBtn, 320, 132, this);
        }
        visibleGameOverNode(visible) {
            if (visible && !this.gameOverNode.visible) {
                AdMgr.instance.hideBanner();
                this['bounesCoin'].visible = GameLogic.Share.gotKillBossBounes;
                if (JJMgr.instance.dataConfig.front_box_ads) {
                    this['gameOverBtnNode'].visible = false;
                    AdMgr.instance.showAppBox(() => {
                        AdMgr.instance.closeAppBox();
                        Laya.timer.clear(this, this.closeAppCB);
                        this['gameOverBtnNode'].visible = true;
                        WxApi.fixBtnTouchPos(this.giveUpBtn, 320, 132, this);
                    });
                    Laya.timer.once(7000, this, this.closeAppCB);
                }
                else {
                    WxApi.fixBtnTouchPos(this.giveUpBtn, 320, 132, this);
                }
                if (GameLogic.Share.gotKillBossBounes) {
                    GameLogic.Share.gotKillBossBounes = false;
                    let c = Utility.GetRandom(30, 100);
                    this['bounesCoin'].text = '成功领取' + c + '金币';
                    Utility.tMove2D(this['bounesCoin'], this['bounesCoin'].x, this['bounesCoin'].y - 100, 2000, () => { this['bounesCoin'].visible = false; });
                    PlayerDataMgr.changeCoin(c);
                }
            }
            else if (!visible) {
                this.moreGameBtn.visible = true;
                AdMgr.instance.hideBanner();
            }
            this.gameOverNode.visible = visible;
        }
        helpBtnCB() {
            WxApi.aldEvent('请求帮助：点击');
            let cb = () => {
                WxApi.aldEvent('请求帮助：成功');
                this.visibleGameOverNode(false);
                GameLogic.Share.isOver = false;
                GameLogic.Share.isHelpStart = true;
                GameLogic.Share.tempPlayerCount = 1;
                GameLogic.Share.restartGame();
            };
            ShareMgr.instance.shareGame(cb);
        }
        giveUpBtnCB() {
            WxApi.aldEvent('第' + PlayerDataMgr.getPlayerData().grade + '关：失败');
            GameLogic.Share.isHelpStart = false;
            GameLogic.Share.gradeIndex = 0;
            PlayerDataMgr.getPlayerData().gradeIndex = 0;
            PlayerDataMgr.setPlayerData();
            this.visibleGameOverNode(false);
            GameLogic.Share.restartGame();
            if (JJMgr.instance.dataConfig.front_box_ads)
                AdMgr.instance.showAppBox();
        }
        createHpBar(node) {
            let bar = PrefabManager.instance().getItem(PrefabItem.HpBar);
            this.playerHp.addChild(bar);
            let crl = bar.addComponent(FixPlayerHpBar);
            crl.initData(node);
        }
        createSmile(node) {
            let smlie = PrefabManager.instance().getItem(PrefabItem.Smile);
            this.addChild(smlie);
            let crl = smlie.getComponent(FixAiTips);
            crl.initData(node);
        }
        createCry(node) {
            let cry = PrefabManager.instance().getItem(PrefabItem.Cry);
            this.addChild(cry);
            let crl = cry.getComponent(FixAiTips);
            crl.initData(node);
        }
        getPowerBtnCB() {
            WxApi.aldEvent('获得体力：点击');
            let cb = () => {
                WxApi.aldEvent('获得体力：成功');
                PlayerDataMgr.getPlayerData().power += 5;
                PlayerDataMgr.setPlayerData();
            };
            ShareMgr.instance.shareGame(cb);
        }
        checkIsNoPower() {
            if (PlayerDataMgr.getPlayerData().gradeIndex == 0 && !GameLogic.Share.gameStarted && !GameLogic.Share.isHelpStart) {
                let p = PlayerDataMgr.getPlayerData().power;
                this.touchPanel.visible = p > 0;
                this.touchNode.visible = p > 0;
                this.noPowerNode.visible = p <= 0;
            }
        }
        createCoinBoom(node) {
            let op = new Laya.Vector4(0, 0, 0);
            let hPos = node.transform.position.clone();
            hPos.y += 1.75;
            GameLogic.Share._camera.viewport.project(hPos, GameLogic.Share._camera.projectionViewMatrix, op);
            let pos = new Laya.Vector2(op.x / Laya.stage.clientScaleX, op.y / Laya.stage.clientScaleY);
            let desPos = new Laya.Vector2(75, 100);
            Utility.coinCollectAnim(pos, desPos, this);
            GameTopNode.Share.initData();
        }
        getBounesBtnCB() {
            WxApi.closePacketUICB = () => {
                GameLogic.Share.pauseGame = false;
            };
            GameLogic.Share.pauseGame = true;
            Laya.Scene.open('MyScenes/OpenPacketsUI.scene', false);
        }
    }

    class Player extends Laya.Script {
        constructor() {
            super();
            this.myOwner = null;
            this._ani = null;
            this.weaponNode = null;
            this.enemyNode = null;
            this.embNode = null;
            this.closeNode = null;
            this.isPlayer = true;
            this.isHited = false;
            this.haveWeapon = false;
            this.isDied = false;
            this.fightStarted = false;
            this.weaponLength = 5;
            this.walkSpeed = 0.08;
            this.myId = 0;
            this.backDistance = 8;
            this.weaponSpeed = 1;
            this.hpMax = 100;
            this.hp = 100;
            this.atk = 20;
            this.embScale = null;
            this.embPos = null;
            this.embRotation = null;
            this.isBossState = false;
        }
        onAwake() {
            this.myOwner = this.owner;
            this._ani = this.owner.getComponent(Laya.Animator);
            this.playIdle1();
            this.weaponNode = Utility.findNodeByName(this.myOwner, 'Dummy_Arms');
            this.embNode = Utility.findNodeByName(this.myOwner, 'Dummy_Emb');
            let emb = Utility.findNodeByName(this.myOwner, 'Hero1_Emb');
            this.embScale = emb.transform.localScale.clone();
            this.embPos = emb.transform.localPosition.clone();
            this.embRotation = emb.transform.localRotation.clone();
        }
        initData(id, isPlayer) {
            this.myId = id;
            this.isPlayer = isPlayer;
            if (!this.isPlayer) {
                this.playIdle2();
            }
            if (isPlayer) {
                this.changeSkin(PlayerDataMgr.freeSkinId != -1 ? PlayerDataMgr.freeSkinId : PlayerDataMgr.getPlayerData().playerId);
                this.hp = PlayerDataMgr.getPlayerPowerData().hp;
                this.hpMax = this.hp;
                this.atk = PlayerDataMgr.getPlayerPowerData().atk;
            }
        }
        playIdle1() {
            this._ani.speed = 1;
            this._ani.crossFade("idle1", 0.05);
        }
        playIdle2() {
            this._ani.speed = 1;
            this._ani.crossFade("idle2", 0.05);
        }
        playWalk() {
            this._ani.play("walk", 0, 0);
            this._ani.crossFade("hit", 0.05, 1);
            let crl = this._ani.getControllerLayer(1);
            crl.getAnimatorState('hit').speed = this.getPlayerAniSpeed();
        }
        playDied() {
            this._ani.crossFade("died", 0.05);
            let crl = this._ani.getControllerLayer(1);
            crl.getAnimatorState('hit').speed = 0;
        }
        getPlayerAniSpeed() {
            let wLength = this.weaponLength;
            if (wLength > 50) {
                return this.weaponSpeed - this.weaponSpeed * (wLength - 50) * 0.01;
            }
            else {
                return this.weaponSpeed;
            }
        }
        getHitbackDistance() {
            let wLength = this.weaponLength;
            if (wLength > 50) {
                return this.backDistance - this.backDistance * (wLength - 50) * 0.01;
            }
            else {
                return this.backDistance;
            }
        }
        addWeapon(weapon) {
            this.weaponNode.addChild(weapon);
            this.weaponLength = this.weaponNode.getChildAt(0).numChildren > 100 ? 100 : this.weaponNode.getChildAt(0).numChildren;
            weapon.transform.localPosition = new Laya.Vector3(0, 0, 0);
            this.haveWeapon = true;
            if (this.weaponNode.numChildren > 30) {
                this.atk = this.atk * (1 + (this.weaponNode.numChildren - 30) * 0.005);
            }
            if (this.isPlayer) {
                SoundMgr.instance.playSoundEffect('weaponReady.mp3');
            }
            this.playIdle2();
        }
        removeWeapon() {
            this.weaponNode.destroyChildren();
        }
        goToFight(enemyNode) {
            if (this.isPlayer) {
                if (this.hp == this.hpMax) {
                    this.hp = PlayerDataMgr.getPlayerPowerData().hp;
                    this.hpMax = this.hp;
                }
                this.atk = PlayerDataMgr.getPlayerPowerData().atk;
            }
            else {
                if (this.hp == this.hpMax) {
                    this.hp = PlayerDataMgr.getNpcData().hp;
                    this.hpMax = this.hp;
                }
                this.atk = PlayerDataMgr.getNpcData().atk;
            }
            this.fightStarted = true;
            this.enemyNode = enemyNode;
            this.isBossState = PlayerDataMgr.getPlayerData().gradeIndex >= 3;
            this.playWalk();
        }
        onUpdate() {
            if (this.enemyNode && this.enemyNode.numChildren > 0 && !this.isHited && !this.isDied && this.fightStarted && !GameLogic.Share.pauseGame) {
                let myPos = this.myOwner.transform.position.clone();
                let disMin = 99999;
                let closeNode = null;
                for (let i = 0; i < this.enemyNode.numChildren; i++) {
                    let eNode = this.enemyNode.getChildAt(i);
                    if (!eNode || !eNode.transform)
                        continue;
                    let crl = eNode.getComponent(Player);
                    if (crl && crl.isDied)
                        continue;
                    let dis = Laya.Vector3.distance(myPos, eNode.transform.position.clone());
                    if (dis < disMin) {
                        disMin = dis;
                        closeNode = eNode;
                    }
                }
                if (this.closeNode && this.closeNode.transform && this.closeNode.getComponent(Player) && !(this.closeNode.getComponent(Player).isDied)) {
                    closeNode = this.closeNode;
                }
                else {
                    this.closeNode = null;
                    this.closeNode = closeNode;
                }
                if (!closeNode)
                    return;
                this.myOwner.transform.lookAt(closeNode.transform.position, new Laya.Vector3(0, 1, 0));
                this.myOwner.transform.rotate(new Laya.Vector3(0, 180, 0), true, false);
                let dir = Utility.getDirectionAToB(this.myOwner, closeNode);
                dir = new Laya.Vector3(dir.x * this.walkSpeed, dir.y * this.walkSpeed, dir.z * this.walkSpeed);
                let desPos = new Laya.Vector3(0, 0, 0);
                Laya.Vector3.add(myPos, dir, desPos);
                if (this.isBossState && disMin < 6) {
                    return;
                }
                else if (!this.isBossState && disMin < 0.5) {
                    return;
                }
                this.myOwner.transform.position = desPos;
            }
        }
        onLateUpdate() {
            if (this.weaponNode && this.enemyNode && this.enemyNode.numChildren > 0 && !this.isHited && !this.isDied && this.fightStarted && !GameLogic.Share.pauseGame) {
                this.checkIsHitEnemy();
            }
        }
        checkIsHitEnemy() {
            let lineNode = this.weaponNode.getChildAt(0);
            if (!lineNode || lineNode == null || lineNode == undefined || this.isDied) {
                return;
            }
            for (let i = 0; i < lineNode.numChildren; i++) {
                let w = lineNode.getChildAt(i);
                let wPos = w.transform.position.clone();
                wPos.y = 0;
                for (let j = 0; j < this.enemyNode.numChildren; j++) {
                    let e = this.enemyNode.getChildAt(j);
                    let ePos = e.transform.position.clone();
                    ePos.y = 0;
                    let dis = Laya.Vector3.distance(wPos, ePos);
                    if (!this.isBossState && dis <= 1) {
                        let pCrl = e.getComponent(Player);
                        pCrl.hitBack(w, this.atk, this.myOwner);
                        return;
                    }
                    else if (this.isBossState && dis <= 5) {
                        let pCrl = e.getComponent(Boss);
                        pCrl.hitBack(this.atk);
                        return;
                    }
                }
            }
        }
        hitBack(node, atk, from) {
            if (this.isDied || this.isHited) {
                return;
            }
            if (!this.isPlayer) {
                WxApi.DoVibrate();
            }
            let id = Utility.GetRandom(1, 4);
            SoundMgr.instance.playSoundEffect('weaponHit' + id + '.mp3');
            this.createHitFX();
            this.hp -= atk;
            if (this.hp <= 0) {
                if (!this.isPlayer) {
                    GameUI.Share.createCry(this.myOwner);
                    GameUI.Share.createCoinBoom(this.myOwner);
                    PlayerDataMgr.changeCoin(10);
                    SoundMgr.instance.playSoundEffect('getCoin.mp3');
                }
                else {
                    GameUI.Share.createSmile(from);
                }
                let id = Utility.GetRandom(1, 2);
                SoundMgr.instance.playSoundEffect('die' + id + '.mp3');
                this.isDied = true;
                this.playDied();
                Laya.timer.once(1000, this, () => {
                    this.owner.destroy();
                });
                return;
            }
            this.isHited = true;
            let pA = node.transform.position.clone();
            let pB = this.myOwner.transform.position.clone();
            let dir = new Laya.Vector3(0, 0, 0);
            Laya.Vector3.subtract(pB, pA, dir);
            Laya.Vector3.normalize(dir, dir);
            dir = new Laya.Vector3(dir.x * this.getHitbackDistance(), 0, dir.z * this.getHitbackDistance());
            let myPos = this.myOwner.transform.position.clone();
            Laya.Vector3.add(myPos, dir, myPos);
            Utility.TmoveTo(this.myOwner, 200, myPos, () => { this.isHited = false; });
        }
        createHitFX() {
            let hit = Laya.loader.getRes(WxApi.UnityPath + 'hitFX.lh');
            let fx = Laya.Sprite3D.instantiate(hit, this.myOwner, true, new Laya.Vector3(0, 2, 0));
            fx.transform.localPosition = new Laya.Vector3(0, 1.5, 0);
            Laya.timer.once(1000, GameLogic.Share, () => {
                fx.destroy();
            });
        }
        changeSkin(id) {
            let mats = new Laya.UnlitMaterial();
            Laya.Texture2D.load('res/skinHero/HeroD_' + (id + 1) + '.png', Laya.Handler.create(this, function (tex) {
                mats.albedoTexture = tex;
            }));
            for (let i = 1; i <= 4; i++) {
                let mesh3d = this.owner.getChildAt(i);
                mesh3d.skinnedMeshRenderer.material = mats;
            }
            this.embNode.destroyChildren();
            let embRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero' + (id + 1) + '_Emb.lh');
            let emb = Laya.Sprite3D.instantiate(embRes, this.embNode, false, new Laya.Vector3(0, 0, 0));
            emb.transform.localScale = this.embScale;
            emb.transform.localPosition = this.embPos;
            emb.transform.localRotation = this.embRotation;
        }
    }

    class GameLogic {
        constructor() {
            this.LINE_GAP = 0.1;
            this.PLAYER_GAP = 3;
            this.GRADE_GAP = 30;
            this._playerNode = new Laya.Sprite3D();
            this._aiNode = new Laya.Sprite3D();
            this.circleEffect = new Laya.Sprite3D();
            this.camStartPos = new Laya.Vector3(0, 0, 0);
            this.canTouch = false;
            this.gameStarted = false;
            this.canReady = false;
            this.isHelpStart = false;
            this.pauseGame = false;
            this.gradeIndex = 0;
            this.tempPlayerCount = 0;
            this.isOver = false;
            this.gotKillBossBounes = false;
            this.isBanGameUIBanner = false;
            this.showBottomBanner = true;
            this.isFinishGame = false;
            this.hadAutoShowUpgrade = false;
            AdMgr.instance.initAd();
            Utility.loadJson('res/config/aiConfig.json', (data) => {
                PlayerDataMgr.aiConfig = data;
            });
            Utility.loadJson('res/config/posConfig.json', (data) => {
                PlayerDataMgr.posConfig = data;
            });
            PlayerDataMgr.getPlayerData();
            PrefabManager.instance();
            new TimeCountMgr();
            PlayerDataMgr.getPlayerData().gradeIndex = 0;
            this.gradeIndex = PlayerDataMgr.getPlayerData().gradeIndex;
            GameLogic.Share = this;
            WxApi.WxOnHide(() => {
                PlayerDataMgr.setExitTime();
                localStorage.setItem('lastDate', new Date().getDate().toString());
                localStorage.setItem('front_share_number', WxApi.front_share_number.toString());
            });
            JJMgr.instance.initJJ(WxApi.version, () => {
                WxApi.calculateShareNumber();
                ShareMgr.instance.initShare();
                Laya.Scene.open('MyScenes/LoadingUI.scene');
                if (Laya.Browser.onWeiXin) {
                    WxApi.sceneId = WxApi.GetLaunchPassVar().scene;
                    console.log('sceneId:', WxApi.sceneId);
                    if (!localStorage.getItem('WhiteList')) {
                        WxApi.isWhiteList = WxApi.allowScene();
                        localStorage.setItem('WhiteList', WxApi.isWhiteList ? '1' : '0');
                    }
                    else {
                        let wl = localStorage.getItem('WhiteList');
                        WxApi.isWhiteList = wl == '1';
                    }
                    console.log('WxApi.isWhiteList:', WxApi.isWhiteList);
                    if (!localStorage.getItem('PacketWhiteList')) {
                        WxApi.isPacketWhiteList = WxApi.allowPacketScene();
                        localStorage.setItem('PacketWhiteList', WxApi.isPacketWhiteList ? '1' : '0');
                    }
                    else {
                        let wl = localStorage.getItem('PacketWhiteList');
                        WxApi.isPacketWhiteList = wl == '1';
                    }
                }
            });
        }
        loadAtlas() {
            var resUrl = [
                { url: 'res/atlas/finishUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/finishUI.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/mainUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/mainUI.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/offlineUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/offlineUI.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/normalUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/normalUI.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/heroSkins.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/heroSkins.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/freeSkins.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/freeSkins.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/skinUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/skinUI.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/boxUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/boxUI.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/packetsUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/packetsUI.png', type: Laya.Loader.IMAGE }
            ];
            var fun = function () {
                Laya.Scene.open('MyScenes/LoadingUI.scene');
            };
            Laya.loader.load(resUrl, Laya.Handler.create(this, fun));
        }
        initScene() {
            Laya.Scene3D.load(WxApi.UnityPath + 'MyScene.ls', Laya.Handler.create(this, this.onLoadScene));
        }
        onLoadScene(scene) {
            this._scene = Laya.stage.addChild(scene);
            Laya.stage.setChildIndex(this._scene, 0);
            this._scene.addChild(this._playerNode);
            this._scene.addChild(this._aiNode);
            this._camera = this._scene.getChildByName('Main Camera');
            this._light = this._scene.getChildByName('Directional Light');
            this._plane = this._scene.getChildByName('Plane');
            this.camStartPos = this._camera.transform.position.clone();
            this.fixCameraField();
            let circleRes = Laya.loader.getRes(WxApi.UnityPath + 'Circle_1.lh');
            this.circleEffect = Laya.Sprite3D.instantiate(circleRes, this._scene, true, new Laya.Vector3(0, 0.1, 0));
            this.circleEffect.active = false;
            Laya.timer.frameLoop(1, this, this.updateCircle);
        }
        fixCameraField() {
            let staticDT = 1624 - 1334;
            let curDT = Laya.stage.displayHeight - 1334 < 0 ? 0 : Laya.stage.displayHeight - 1334;
            let per = curDT / staticDT * 10;
            this._camera.fieldOfView = 70 + per;
        }
        moveCamera(z, duration = 2000) {
            let cam = this._camera;
            let camPos = cam.transform.position.clone();
            camPos.z += z;
            Utility.TmoveTo(cam, duration, camPos, () => { });
        }
        createPlayer() {
            let playerRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero_1.lh');
            let sx = (PlayerDataMgr.getPlayerCount() + this.tempPlayerCount - 1) * this.PLAYER_GAP / 2;
            for (let i = 0; i < PlayerDataMgr.getPlayerCount() + this.tempPlayerCount; i++) {
                let player = Laya.Sprite3D.instantiate(playerRes, this._playerNode, false, new Laya.Vector3(0, 0, 0));
                let pCrl = player.addComponent(Player);
                pCrl.initData(i, true);
                player.transform.translate(new Laya.Vector3(sx, 0, this.GRADE_GAP * this.gradeIndex), false);
                sx -= this.PLAYER_GAP;
                GameUI.Share.createHpBar(player);
            }
        }
        pushPlayer() {
            let playerRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero_1.lh');
            let sx = (PlayerDataMgr.getPlayerCount() - 1) * this.PLAYER_GAP / 2;
            for (let i = 0; i < PlayerDataMgr.getPlayerCount(); i++) {
                if (i + 1 <= this._playerNode.numChildren) {
                    sx -= this.PLAYER_GAP;
                    let crl = this._playerNode.getChildAt(i).getComponent(Player);
                    crl.hp = crl.hpMax;
                    continue;
                }
                let player = Laya.Sprite3D.instantiate(playerRes, this._playerNode, false, new Laya.Vector3(0, 0, 0));
                let pCrl = player.addComponent(Player);
                pCrl.initData(i, true);
                player.transform.translate(new Laya.Vector3(sx, 0, this.GRADE_GAP * this.gradeIndex), false);
                sx -= this.PLAYER_GAP;
                GameUI.Share.createHpBar(player);
            }
        }
        updateCircle() {
            if (!this._playerNode || this._playerNode.numChildren <= 0) {
                this.circleEffect.active = false;
                return;
            }
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let player = this._playerNode.getChildAt(i);
                let crl = player.getComponent(Player);
                if (!crl.haveWeapon) {
                    let pos = player.transform.position.clone();
                    let p = new Laya.Vector3(pos.x, 0.1, pos.z + 0.1);
                    this.circleEffect.transform.position = p;
                    this.circleEffect.active = true;
                    return;
                }
            }
            this.circleEffect.active = false;
        }
        createAi() {
            if (PlayerDataMgr.getPlayerData().gradeIndex >= 3) {
                this.createBoss();
                return;
            }
            let aiDataMaxGrade = 19;
            let data = null;
            let skinId = 0;
            let sort = [];
            let gidArr = [];
            let wpId = 0;
            if (PlayerDataMgr.getPlayerData().grade > aiDataMaxGrade) {
                sort = PlayerDataMgr.posConfig.sort;
                skinId = Utility.GetRandom(0, 9);
                gidArr = Utility.getRandomItemInArr(sort);
                wpId = Utility.GetRandom(1, 7);
            }
            else {
                data = PlayerDataMgr.aiConfig['grade' + PlayerDataMgr.getPlayerData().grade];
                skinId = data.skinId;
                sort = data.sort;
                gidArr = sort[PlayerDataMgr.getPlayerData().gradeIndex];
            }
            this._aiNode.transform.position = new Laya.Vector3(0, 0, 10 + (this.GRADE_GAP * this.gradeIndex));
            let playerRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero_1.lh');
            let sx = this.PLAYER_GAP;
            for (let i = 0; i < gidArr.length; i++) {
                let player = Laya.Sprite3D.instantiate(playerRes, this._aiNode, true, new Laya.Vector3(0, 0, 0));
                let pCrl = player.addComponent(Player);
                pCrl.initData(i, false);
                pCrl.changeSkin(skinId);
                player.transform.localPosition.x = gidArr[i][0] * sx;
                player.transform.localPosition.y = 0;
                player.transform.localPosition.z = gidArr[i][1] * sx;
                player.transform.rotate(new Laya.Vector3(0, 180, 0), true, false);
                GameUI.Share.createHpBar(player);
                let weaponId = PlayerDataMgr.getPlayerData().grade > aiDataMaxGrade ? wpId : gidArr[i][2] + 1;
                let weaponRes = Laya.loader.getRes(WxApi.UnityPath + 'Arms_' + weaponId + '.lh');
                let weapon = Laya.Sprite3D.instantiate(weaponRes, null, true, new Laya.Vector3(0, 0, 0));
                pCrl.addWeapon(weapon);
            }
        }
        createBoss() {
            this._aiNode.transform.position = new Laya.Vector3(0, 0, 10 + (this.GRADE_GAP * this.gradeIndex));
            let playerRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero_Boss.lh');
            let ani = playerRes.getComponent(Laya.Animator);
            ani.getControllerLayer().playOnWake = false;
            let player = Laya.Sprite3D.instantiate(playerRes, this._aiNode, true, new Laya.Vector3(0, 0, 0));
            let pCrl = player.addComponent(Boss);
            player.transform.localPosition.x = 0;
            player.transform.localPosition.y = 0;
            player.transform.localPosition.z = 0;
            player.transform.rotate(new Laya.Vector3(0, 180, 0), true, false);
        }
        createLine3D(lineArr) {
            let lineNode = new Laya.Sprite3D();
            let lineRes = Laya.loader.getRes(WxApi.UnityPath + 'line.lh');
            let bottomPos = new Laya.Vector3(0, 0, 0);
            for (let i = 0; i < lineArr.length; i++) {
                if (i == 0) {
                    let line = Laya.Sprite3D.instantiate(lineRes, lineNode, false, new Laya.Vector3(0, 0, 0));
                    line.transform.position = new Laya.Vector3(0, 0, 0);
                    bottomPos = line.transform.position.clone();
                }
                else {
                    let p1 = new Laya.Vector3(-lineArr[i - 1].x, 0, -lineArr[i - 1].y);
                    let p2 = new Laya.Vector3(-lineArr[i].x, 0, -lineArr[i].y);
                    let preL = lineNode.getChildAt(lineNode.numChildren - 1);
                    let prePos = preL.transform.position.clone();
                    let dis = Laya.Vector3.distance(p1, p2);
                    for (let j = 0; j < Math.floor(dis / 10); j++) {
                        let line = Laya.Sprite3D.instantiate(lineRes, lineNode, false, new Laya.Vector3(0, 0, 0));
                        let dir = new Laya.Vector3(0, 0, 0);
                        Laya.Vector3.subtract(p2, p1, dir);
                        Laya.Vector3.normalize(dir, dir);
                        let d = (this.LINE_GAP * (j + 1));
                        dir = new Laya.Vector3(dir.x * d, dir.y * d, dir.z * d);
                        let pos = new Laya.Vector3(0, 0, 0);
                        Laya.Vector3.add(prePos, dir, pos);
                        line.transform.position = pos;
                        if (line.transform.position.z < bottomPos.z) {
                            bottomPos = line.transform.position.clone();
                        }
                    }
                }
            }
            for (let i = 0; i < lineNode.numChildren; i++) {
                let node = lineNode.getChildAt(i);
                let p = new Laya.Vector3(0, 0, 0);
                Laya.Vector3.subtract(node.transform.position, bottomPos, p);
                node.transform.position = p;
            }
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let pCrl = this._playerNode.getChildAt(i).getComponent(Player);
                if (!pCrl.haveWeapon) {
                    pCrl.addWeapon(lineNode);
                    break;
                }
            }
            if (this.checkWeaponed()) {
                this.readyGo();
            }
        }
        checkWeaponed() {
            let allWeapon = true;
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let pCrl = this._playerNode.getChildAt(i).getComponent(Player);
                if (!pCrl.haveWeapon) {
                    allWeapon = false;
                }
            }
            return allWeapon;
        }
        readyGo() {
            if (PlayerDataMgr.getFreeSkins().length > 0 &&
                !this.canReady &&
                PlayerDataMgr.getPlayerData().grade >= JJMgr.instance.dataConfig.front_share_try &&
                PlayerDataMgr.getPlayerData().gradeIndex == 0) {
                Laya.Scene.open('MyScenes/FreeSkinUI.scene', false);
                return;
            }
            if (!WxApi.firstStartGame) {
                WxApi.firstStartGame = true;
                WxApi.aldEvent('进入游戏后首次点击开始游戏');
            }
            if (PlayerDataMgr.getPlayerData().gradeIndex == 0) {
                WxApi.aldEvent('开始游戏');
                WxApi.aldEvent('第' + PlayerDataMgr.getPlayerData().grade + '关：进入');
            }
            this.canTouch = false;
            GameUI.Share.visibleBottomUI(false);
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let pCrl = this._playerNode.getChildAt(i).getComponent(Player);
                pCrl.goToFight(this._aiNode);
            }
            if (PlayerDataMgr.getPlayerData().gradeIndex < 3) {
                for (let i = 0; i < this._aiNode.numChildren; i++) {
                    let pCrl = this._aiNode.getChildAt(i).getComponent(Player);
                    pCrl.goToFight(this._playerNode);
                }
            }
            Laya.timer.clear(this, this.checkIsOver);
            Laya.timer.frameLoop(1, this, this.checkIsOver);
        }
        checkIsOver() {
            if (this._aiNode.numChildren <= 0) {
                if (this._playerNode.numChildren <= PlayerDataMgr.getPlayerCount()) {
                    this.tempPlayerCount = 0;
                }
                this.gradeIndex += 1;
                Laya.timer.clear(this, this.checkIsOver);
                if (this.gradeIndex >= 4) {
                    this.isFinishGame = true;
                    this.tempPlayerCount = 0;
                    WxApi.tempGrade = PlayerDataMgr.getPlayerData().grade;
                    PlayerDataMgr.getPlayerData().grade += 1;
                    PlayerDataMgr.getPlayerData().gradeIndex = 0;
                    PlayerDataMgr.setPlayerData();
                    Laya.Scene.close('MyScenes/GameUI.scene');
                    if (JJMgr.instance.dataConfig.front_box_page && WxApi.isValidBanner()) {
                        Laya.Scene.open('MyScenes/KillBossUI.scene', true, () => {
                            if (WxApi.isValidPacket(true)) {
                                WxApi.closePacketUICB = () => {
                                    this._playerNode.active = true;
                                    Laya.Scene.open('MyScenes/FinishUI.scene', false);
                                };
                                Laya.Scene.open('MyScenes/OpenPacketsUI.scene', false);
                            }
                            else {
                                this._playerNode.active = true;
                                Laya.Scene.open('MyScenes/FinishUI.scene', false);
                            }
                        });
                        this._playerNode.active = false;
                    }
                    else {
                        if (WxApi.isValidPacket(true)) {
                            WxApi.closePacketUICB = () => {
                                Laya.Scene.open('MyScenes/FinishUI.scene', false);
                            };
                            Laya.Scene.open('MyScenes/OpenPacketsUI.scene', false);
                        }
                        else {
                            Laya.Scene.open('MyScenes/FinishUI.scene', false);
                        }
                    }
                    return;
                }
                PlayerDataMgr.getPlayerData().gradeIndex = this.gradeIndex;
                PlayerDataMgr.setPlayerData();
                GameTopNode.Share.initData();
                Laya.timer.once(200, this, () => {
                    this.moveCamera(this.GRADE_GAP, 1800);
                });
                let sx = (PlayerDataMgr.getPlayerCount() + this.tempPlayerCount - 1) * this.PLAYER_GAP / 2;
                for (let i = 0; i < this._playerNode.numChildren; i++) {
                    let player = this._playerNode.getChildAt(i);
                    let pCrl = player.getComponent(Player);
                    pCrl.fightStarted = false;
                    let desPos = new Laya.Vector3(sx - i * this.PLAYER_GAP, 0, this.GRADE_GAP * this.gradeIndex);
                    Utility.TmoveTo(player, 2000, desPos, () => {
                        pCrl.playIdle2();
                    });
                    Utility.RotateTo(player, 1000, new Laya.Vector3(0, 0, 0), () => { });
                }
                this.createAi();
                Laya.timer.once(2000, this, () => {
                    this.checkIsNeedCreatePlayer();
                });
            }
            if (this._playerNode.numChildren <= 0 && !this.isOver) {
                this.isFinishGame = true;
                this.isOver = true;
                this.tempPlayerCount = 0;
                Laya.Scene.close('MyScenes/GameUI.scene');
                let cb = () => {
                    GameLogic.Share.isBanGameUIBanner = true;
                    GameLogic.Share._playerNode.active = true;
                    GameLogic.Share._aiNode.active = true;
                    Laya.Scene.open('MyScenes/GameUI.scene', false, () => {
                        GameUI.Share.visibleGameOverNode(true);
                    });
                };
                GameLogic.Share._playerNode.active = false;
                GameLogic.Share._aiNode.active = false;
                WxApi.tempGrade = PlayerDataMgr.getPlayerData().grade;
                if (JJMgr.instance.dataConfig.front_box_page && WxApi.isValidBanner()) {
                    Laya.Scene.open('MyScenes/KillBossUI.scene', false, () => {
                        if (WxApi.isValidPacket()) {
                            WxApi.closePacketUICB = cb;
                            Laya.Scene.open('MyScenes/OpenPacketsUI.scene', false);
                        }
                        else {
                            cb();
                        }
                    });
                }
                else {
                    if (WxApi.isValidPacket()) {
                        WxApi.closePacketUICB = cb;
                        Laya.Scene.open('MyScenes/OpenPacketsUI.scene', false);
                    }
                    else {
                        cb();
                    }
                }
            }
        }
        getIsOver() {
            if (this._playerNode.numChildren <= 0) {
                return true;
            }
            else {
                let isOver = true;
                for (let i = 0; i < this._playerNode.numChildren; i++) {
                    let p = this._playerNode.getChildAt(i);
                    let crl = p.getComponent(Player);
                    if (!crl.isDied) {
                        isOver = false;
                        break;
                    }
                }
                return isOver;
            }
        }
        checkIsNeedCreatePlayer() {
            if (this._playerNode.numChildren < PlayerDataMgr.getPlayerCount() && this.gradeIndex < 3) {
                AdMgr.instance.hideBanner();
                GameUI.Share.reviveBtnCB();
            }
            else {
                AdMgr.instance.hideBanner();
                this.showBottomBanner = true;
                this.readyGo();
            }
        }
        revivePlayer() {
            this.canTouch = true;
            this.pushPlayer();
        }
        goAhead() {
            this.readyGo();
        }
        upgradePlayerCount() {
            this._playerNode.destroyChildren();
            this.createPlayer();
        }
        changePlayerSkin(freeId) {
            for (let i = 0; i < this._playerNode.numChildren; i++) {
                let player = this._playerNode.getChildAt(i);
                let crl = player.getComponent(Player);
                if (freeId)
                    crl.changeSkin(freeId);
                else
                    crl.changeSkin(PlayerDataMgr.getPlayerData().playerId);
            }
        }
        checkCanUpgrade() {
            let c = PlayerDataMgr.getPlayerData().coin;
            if (!this.hadAutoShowUpgrade && PlayerDataMgr.getPlayerData().gradeIndex == 0 &&
                (c >= PlayerDataMgr.getUpgradePlayerCountLvCost() || c >= PlayerDataMgr.getUpgradePlayerPowerLvCost() || c >= PlayerDataMgr.getUpgradeOfflineLvCost())) {
                this.hadAutoShowUpgrade = true;
                GameUI.Share.upgradeBtnCB();
            }
        }
        restartGame() {
            this.isFinishGame = false;
            this.isOver = false;
            GameLogic.Share.gotKillBossBounes = false;
            this.gameStarted = false;
            if (PlayerDataMgr.getPlayerData().gradeIndex == 0) {
                this._camera.transform.position = this.camStartPos;
                if (!this.isHelpStart) {
                    this.canReady = false;
                    if (PlayerDataMgr.freeSkinId != -1) {
                        PlayerDataMgr.freeSkinId = -1;
                    }
                }
            }
            this._aiNode.destroyChildren();
            this._playerNode.destroyChildren();
            this.createAi();
            this.createPlayer();
            GameUI.Share.visibleBottomUI(true);
            this.canTouch = true;
            GameTopNode.Share.initData();
            this.checkCanUpgrade();
        }
    }
    GameLogic.WEAPON_LENGTH_MAX = 100;
    GameLogic.WEAPON_LENGTH_MIN = 10;

    class BoxUI extends Laya.Scene {
        constructor() {
            super();
            this.backBtn = this['backBtn'];
            this.coinNum = this['coinNum'];
            this.skinIcon = this['skinIcon'];
            this.boxNode = this['boxNode'];
            this.keyNode = this['keyNode'];
            this.videoBtn = this['videoBtn'];
            this.keyNum = 3;
            this.clickCount = 0;
            this.skinId = -1;
            this.skinIndex = -1;
            this.gotBounes = false;
        }
        onOpened(param) {
            this.backBtn.on(Laya.Event.CLICK, this, this.backBtnCB);
            this.videoBtn.on(Laya.Event.CLICK, this, this.videoBtnCB);
            this.initKey();
            this.initCoin();
            this.getBoxSkinId();
            for (let i = 0; i < this.boxNode.numChildren; i++) {
                let item = this.boxNode.getChildAt(i);
                item.on(Laya.Event.CLICK, this, this.itemCB, [i]);
                let coinNode = item.getChildByName('coinNode');
                coinNode.visible = false;
            }
        }
        onClosed() {
            if (JJMgr.instance.dataConfig.front_box_ads)
                AdMgr.instance.showAppBox();
        }
        getBoxSkinId() {
            let arr = PlayerDataMgr.getBoxSkins();
            if (arr.length <= 0) {
                this.skinId = -1;
                this.skinIcon.skin = 'mainUI/sy-jb.png';
                return;
            }
            this.skinIndex = Math.floor(Math.random() * arr.length);
            this.skinId = arr[this.skinIndex];
            if (this.skinId == -1) {
                this.skinIcon.skin = 'mainUI/sy-jb.png';
            }
            else {
                this.skinIcon.skin = PlayerDataMgr.getHeroSkinDir(this.skinId);
            }
        }
        initKey() {
            for (let i = 0; i < 3; i++) {
                let key = this.keyNode.getChildAt(i);
                key.skin = i < this.keyNum ? 'boxUI/bx-ys1.png' : 'boxUI/bx-ys2.png';
            }
        }
        initCoin() {
            this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString();
        }
        itemCB(id) {
            let item = this.boxNode.getChildAt(id);
            let box = item.getChildByName('box');
            let coinNode = item.getChildByName('coinNode');
            let coinNum = coinNode.getChildByName('coinNum');
            if (item.skin == 'boxUI/bx-di2.png' || this.keyNum <= 0)
                return;
            item.skin = 'boxUI/bx-di2.png';
            this.keyNum--;
            this.clickCount++;
            this.initKey();
            if (this.clickCount >= 9) {
                this.keyNode.visible = false;
                this.videoBtn.visible = false;
            }
            else if (this.keyNum <= 0) {
                this.keyNode.visible = false;
                this.videoBtn.visible = true;
            }
            let isSkin = false;
            let bounes = 5;
            let randNum = Math.random() * 100;
            if (randNum <= 20) {
            }
            else if (randNum <= 35) {
                bounes = 10;
            }
            else if (randNum <= 45) {
                bounes = 15;
            }
            else if (randNum <= 55) {
                bounes = 20;
            }
            else if (randNum <= 65) {
                bounes = 25;
            }
            else if (randNum <= 75) {
                bounes = 30;
            }
            else if (randNum <= 85) {
                bounes = 35;
            }
            else if (randNum <= 95) {
                bounes = 50;
            }
            else {
                if (this.skinId == -1 || this.gotBounes) {
                    isSkin = false;
                    bounes = 50;
                }
                else {
                    this.gotBounes = true;
                    isSkin = true;
                }
            }
            if (this.clickCount >= 9 && this.skinId != -1 && !this.gotBounes) {
                this.gotBounes = true;
                isSkin = true;
            }
            if (isSkin) {
                PlayerDataMgr.getPlayerSkin(PlayerDataMgr.skinArr3.indexOf(this.skinId) + 18, this.skinId);
                box.visible = true;
                box.skin = PlayerDataMgr.getHeroSkinDir(this.skinId);
                box.y = 65;
            }
            else {
                SoundMgr.instance.playSoundEffect('getCoin.mp3');
                PlayerDataMgr.changeCoin(bounes);
                this.initCoin();
                box.visible = false;
                coinNode.visible = true;
                coinNum.value = bounes.toString();
            }
        }
        videoBtnCB() {
            WxApi.aldEvent('增加三个钥匙：点击');
            let cb = () => {
                WxApi.aldEvent('增加三个钥匙：成功');
                this.keyNum = 3;
                this.videoBtn.visible = false;
                this.keyNode.visible = true;
                this.initKey();
            };
            ShareMgr.instance.shareGame(cb);
        }
        backBtnCB() {
            Laya.Scene.open('MyScenes/GameUI.scene', true, () => { GameLogic.Share.restartGame(); });
        }
    }

    class FixAdShareIcon extends Laya.Script {
        constructor() {
            super();
            this.shareIconStr = '';
            this.videoIconStr = '';
            this.myOwner = null;
        }
        onAwake() {
            this.myOwner = this.owner;
        }
        onDisable() {
        }
        onUpdate() {
            if (WxApi.front_share_number > 0) {
                this.myOwner.skin = this.shareIconStr;
            }
            else {
                this.myOwner.skin = this.videoIconStr;
            }
        }
    }

    class FixNodeY extends Laya.Script {
        constructor() {
            super();
        }
        onAwake() {
            let myOwner = this.owner;
            myOwner.y = myOwner.y * Laya.stage.displayHeight / 1334;
        }
    }

    class CashRecordUI extends Laya.Scene {
        constructor() {
            super();
            this.closeBtn = this['closeBtn'];
        }
        onOpened() {
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB);
        }
        onClosed() {
        }
        closeBtnCB() {
            this.close();
        }
    }

    class FinishUI extends Laya.Scene {
        constructor() {
            super();
            this.openBoxBtn = this['openBoxBtn'];
            this.videoBtn = this['videoBtn'];
            this.noBtn = this['noBtn'];
            this.bounes = this['bounes'];
            this.moreGameBtn = this['moreGameBtn'];
            this.boxBtnEnabled = true;
        }
        onOpened(param) {
            WxApi.aldEvent('第' + PlayerDataMgr.getPlayerData().grade + '关：通关');
            this.initData();
            AdMgr.instance.hideBanner();
        }
        onClosed() {
            AdMgr.instance.hideBanner();
            Laya.timer.clearAll(this);
        }
        initData() {
            this.openBoxBtn.on(Laya.Event.CLICK, this, this.openBoxCB);
            this.videoBtn.on(Laya.Event.CLICK, this, this.videoBtnCB);
            this.noBtn.on(Laya.Event.CLICK, this, this.noBtnCB);
            this.moreGameBtn.on(Laya.Event.CLICK, this, this.moreGameBtnCB);
            Utility.rotateLoop(this.moreGameBtn.getChildAt(0), 15, 100);
            let grade = PlayerDataMgr.getPlayerData().grade - 1;
            let g = Math.floor(grade % 4) == 0 ? 4 : Math.floor(grade % 4);
            this.bounes.skin = g == 4 ? 'finishUI/js-bx.png' : 'finishUI/js-ys.png';
            this.openBoxBtn.visible = g == 4;
            this.videoBtn.visible = g != 4;
            this.noBtn.visible = g != 4;
            if (JJMgr.instance.dataConfig.front_box_ads) {
                this['btnNode'].visible = false;
                AdMgr.instance.showAppBox(() => {
                    this.closeAppCB();
                });
                Laya.timer.once(7000, this, this.closeAppCB);
            }
            else {
                if (this.noBtn.visible)
                    WxApi.fixBtnTouchPos(this.noBtn, 320, 100, this);
                else {
                    this.boxBtnEnabled = false;
                    WxApi.fixBtnTouchPos(this.openBoxBtn, 320, 0, this, () => { this.boxBtnEnabled = true; });
                }
            }
            GameLogic.Share.isHelpStart = false;
            GameLogic.Share.gradeIndex = 0;
            PlayerDataMgr.getPlayerData().gradeIndex = 0;
            PlayerDataMgr.setPlayerData();
            this['bounesCoin'].visible = GameLogic.Share.gotKillBossBounes;
            if (GameLogic.Share.gotKillBossBounes) {
                GameLogic.Share.gotKillBossBounes = false;
                let c = Utility.GetRandom(30, 100);
                this['bounesCoin'].text = '成功领取' + c + '金币';
                Utility.tMove2D(this['bounesCoin'], this['bounesCoin'].x, this['bounesCoin'].y - 100, 2000, () => { this['bounesCoin'].visible = false; });
                PlayerDataMgr.changeCoin(c);
            }
        }
        closeAppCB() {
            let self = this;
            AdMgr.instance.closeAppBox();
            Laya.timer.clearAll(this);
            self['btnNode'].visible = true;
            if (self.noBtn.visible)
                WxApi.fixBtnTouchPos(self.noBtn, 320, 100, self);
            else {
                self.boxBtnEnabled = false;
                WxApi.fixBtnTouchPos(self.openBoxBtn, 320, 0, self, () => { self.boxBtnEnabled = true; });
            }
        }
        moreGameBtnCB() {
            AdMgr.instance.showAppBox();
        }
        openBoxCB() {
            if (!this.boxBtnEnabled)
                return;
            Laya.Scene.open('MyScenes/BoxUI.scene');
        }
        videoBtnCB() {
            WxApi.aldEvent('视频/分享打开宝箱：点击');
            let cb = () => {
                WxApi.aldEvent('视频/分享打开宝箱：成功');
                Laya.Scene.open('MyScenes/BoxUI.scene');
            };
            ShareMgr.instance.shareGame(cb);
        }
        noBtnCB() {
            this.close();
            Laya.Scene.open('MyScenes/GameUI.scene', false, () => {
                GameLogic.Share.restartGame();
                if (JJMgr.instance.dataConfig.front_box_ads)
                    AdMgr.instance.showAppBox();
            });
        }
    }

    class FreeSkinUI extends Laya.Scene {
        constructor() {
            super();
            this.closeBtn = this['closeBtn'];
            this.itemNode = this['itemNode'];
            this.randBtn = this['randBtn'];
            this.skinArr = [];
        }
        onOpened(param) {
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB);
            this.randBtn.on(Laya.Event.CLICK, this, this.randBtnCB);
            this.skinArr = PlayerDataMgr.getFreeSkins();
            this.initData();
            WxApi.fixBtnTouchPos(this.closeBtn, 770, 540, this);
        }
        onClosed() {
            AdMgr.instance.hideBanner();
        }
        initData() {
            for (let i = 0; i < 4; i++) {
                let item = this.itemNode.getChildAt(i);
                if (i >= this.skinArr.length) {
                    item.visible = false;
                    continue;
                }
                let icon = item.getChildByName('icon');
                icon.skin = 'freeSkins/HeroD_' + (this.skinArr[i] + 1) + '.png';
                let id = this.skinArr[i];
                item.off(Laya.Event.CLICK, this, this.itemCB);
                item.on(Laya.Event.CLICK, this, this.itemCB, [id]);
            }
        }
        itemCB(id) {
            WxApi.aldEvent('试用皮肤：点击');
            let cb = () => {
                WxApi.aldEvent('试用皮肤：成功');
                PlayerDataMgr.freeSkinId = id;
                GameLogic.Share.changePlayerSkin(id);
                this.closeBtnCB();
            };
            ShareMgr.instance.shareGame(cb);
        }
        randBtnCB() {
            let id = Utility.getRandomItemInArr(this.skinArr);
            this.itemCB(id);
        }
        closeBtnCB() {
            this.close();
            GameLogic.Share.canReady = true;
            GameLogic.Share.readyGo();
        }
    }

    class KillBossUI extends Laya.Scene {
        constructor() {
            super();
            this.closeBtn = this['closeBtn'];
            this.barNode = this['barNode'];
            this.clickBtn = this['clickBtn'];
            this.atkAni = this['atkAni'];
            this.clickBossBtn = this['clickBossBtn'];
            this.isBannerType = true;
            this.curProgress = 0;
            this.closeCallback = null;
            this.hadShowBanner = false;
            this.canShowBox = true;
        }
        onOpened(param) {
            if (param != null && param != undefined) {
                this.closeCallback = param;
            }
            this.atkAni.loop = false;
            let randNum = Math.random() * 100;
            if (randNum <= JJMgr.instance.dataConfig.front_banner_probability) {
                this.isBannerType = true;
                this.clickBtn.visible = true;
                this.clickBossBtn.visible = false;
            }
            else {
                this.isBannerType = false;
                this.clickBtn.visible = false;
                this.clickBossBtn.visible = true;
            }
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB);
            this.clickBtn.on(Laya.Event.MOUSE_DOWN, this, this.clickBtnCBDown);
            this.clickBtn.on(Laya.Event.MOUSE_UP, this, this.clickBtnCBUp);
            this.clickBossBtn.on(Laya.Event.MOUSE_DOWN, this, this.clickBossBtnCB);
            Utility.visibleDelay(this.closeBtn, 3000);
            Laya.timer.frameLoop(1, this, this.decBar);
            WxApi.isKillBossUI = true;
            WxApi.WxOnHide(() => {
                if (WxApi.isKillBossUI) {
                    Laya.timer.once(100, this, () => { Laya.Scene.close('MyScenes/KillBossUI.scene'); });
                }
            });
            AdMgr.instance.hideBanner();
        }
        onClosed() {
            AdMgr.instance.closeAppBox();
            Laya.timer.clearAll(this);
            this.closeCallback && this.closeCallback();
            WxApi.isKillBossUI = false;
        }
        decBar() {
            if (this.curProgress >= 1) {
                Laya.timer.clear(this, this.decBar);
                return;
            }
            this.curProgress -= 0.005;
            if (this.curProgress < 0) {
                this.curProgress = 0;
            }
            this.barNode.value = this.curProgress;
        }
        clickBtnCBDown() {
            GameLogic.Share.gotKillBossBounes = true;
            let curG = WxApi.tempGrade;
            let gGap = (curG - JJMgr.instance.dataConfig.front_box_gate) % (JJMgr.instance.dataConfig.front_box_everygate) == 0 &&
                (curG - JJMgr.instance.dataConfig.front_box_gate) >= 0;
            if (!this.hadShowBanner && curG >= JJMgr.instance.dataConfig.front_box_gate && gGap && WxApi.isValidBanner(curG) && JJMgr.instance.dataConfig.front_box_page) {
                this.hadShowBanner = true;
                Laya.timer.once(500, this, () => {
                    AdMgr.instance.showBanner();
                });
            }
            this.atkAni.play(0, false);
            this.clickBtn.scaleX = 1.2;
            this.clickBtn.scaleY = 1.2;
            this.curProgress += 0.15;
            if (this.curProgress > 1) {
                this.curProgress = 1;
                this.barNode.value = 1;
                this.close();
                return;
            }
            this.createCoin();
            this.createCoin();
            this.createCoin();
            this.createCoin();
            this.createCoin();
        }
        clickBtnCBUp() {
            this.clickBtn.scaleX = 1;
            this.clickBtn.scaleY = 1;
        }
        clickBossBtnCB() {
            GameLogic.Share.gotKillBossBounes = true;
            let curG = WxApi.tempGrade;
            let gGap = (curG - JJMgr.instance.dataConfig.front_box_gate) % (JJMgr.instance.dataConfig.front_box_everygate) == 0 &&
                (curG - JJMgr.instance.dataConfig.front_box_gate) >= 0;
            if (!this.hadShowBanner && curG >= JJMgr.instance.dataConfig.front_box_gate && gGap && WxApi.isValidBanner(curG) &&
                this.canShowBox && JJMgr.instance.dataConfig.front_box_page) {
                this.hadShowBanner = true;
                Laya.timer.once(500, this, () => {
                    AdMgr.instance.showAppBox();
                });
            }
            this.curProgress += 0.15;
            if (this.curProgress > 1) {
                this.curProgress = 1;
                this.barNode.value = 1;
                this.close();
                return;
            }
            this.createCoin();
            this.createCoin();
            this.createCoin();
            this.createCoin();
            this.createCoin();
        }
        closeBtnCB() {
            this.close();
        }
        createCoin() {
            let coin = PrefabManager.instance().getItem(PrefabItem.Coin);
            this.addChild(coin);
            coin.pos(375, 500);
            let desPos = new Laya.Vector2(Math.random() * 400 - 200, Math.random() * 400 - 200);
            Laya.Tween.to(coin, { x: desPos.x + 375, y: desPos.y + 500 }, 200);
            Laya.timer.once(1000, this, () => {
                coin.destroy();
            });
        }
    }

    class LoadingUI extends Laya.Scene {
        constructor() {
            super();
            this.perNum = this['perNum'];
            this.bar = this['bar'];
        }
        onOpened(param) {
            SoundMgr.instance.initLoading(() => {
                this.loadRes();
            });
            WxApi.aldEvent('加载页面');
        }
        onClosed() {
        }
        loadSubpackage() {
            const loadTask = Laya.Browser.window.qq.loadSubpackage({
                name: 'unity',
                success: (res) => {
                    this.loadRes();
                },
                fail: (res) => {
                    this.loadSubpackage();
                }
            });
            loadTask.onProgressUpdate(res => {
                console.log('下载进度', res.progress);
                console.log('已经下载的数据长度', res.totalBytesWritten);
                console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite);
                this.perNum.text = Math.floor(res.progress / 2) + '%';
                this.bar.width = 560 * (res.progress / 50);
            });
        }
        loadRes() {
            var resUrl = [
                WxApi.UnityPath + 'line.lh',
                WxApi.UnityPath + 'Hero_1.lh',
                WxApi.UnityPath + 'Hero_Boss.lh',
                WxApi.UnityPath + 'Circle_1.lh',
                WxApi.UnityPath + 'hitFX.lh'
            ];
            for (let i = 0; i < 7; i++) {
                resUrl.push(WxApi.UnityPath + 'Arms_' + (i + 1) + '.lh');
            }
            for (let i = 0; i < 10; i++) {
                resUrl.push(WxApi.UnityPath + 'Hero' + (i + 1) + '_Emb.lh');
            }
            Laya.loader.create(resUrl, Laya.Handler.create(this, this.onComplete), Laya.Handler.create(this, this.onProgress));
        }
        onComplete() {
            let cb = () => {
                GameLogic.Share.initScene();
                Laya.timer.once(1000, this, () => {
                    let cb = () => {
                        GameLogic.Share.createPlayer();
                        GameLogic.Share.createAi();
                    };
                    Laya.Scene.open('MyScenes/GameUI.scene', true, cb);
                    WxApi.aldEvent('进入首页');
                });
            };
            this.loadAtlas(cb);
        }
        onProgress(value) {
            this.perNum.text = (50 + Math.floor(value * 50)) + '%';
            this.bar.width = (560 / 2) + 560 * value / 2;
        }
        loadAtlas(cb) {
            var resUrl = [
                { url: 'res/atlas/finishUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/finishUI.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/mainUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/mainUI.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/offlineUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/offlineUI.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/normalUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/normalUI.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/heroSkins.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/heroSkins.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/freeSkins.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/freeSkins.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/skinUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/skinUI.png', type: Laya.Loader.IMAGE },
                { url: 'res/atlas/boxUI.atlas', type: Laya.Loader.ATLAS },
                { url: 'res/atlas/boxUI.png', type: Laya.Loader.IMAGE }
            ];
            Laya.loader.load(resUrl, Laya.Handler.create(this, cb));
        }
    }

    class OfflineUI extends Laya.Scene {
        constructor() {
            super();
            this.coinNum = this['coinNum'];
            this.noBtn = this['noBtn'];
            this.trippleBtn = this['trippleBtn'];
            this.toggleBtn = this['toggleBtn'];
            this.point = this['point'];
            this.exTimeMin = 0;
            this.bounesNum = 0;
            this.bounesNumTriple = 0;
            this.isTripple = true;
            this.updateCompleted = true;
        }
        onOpened(param) {
            WxApi.isShowAppBox = false;
            this.toggleBtn.on(Laya.Event.CLICK, this, this.trippleBtnCB);
            this.trippleBtn.on(Laya.Event.CLICK, this, this.getBounesCB);
            this.noBtn.on(Laya.Event.CLICK, this, this.getBounesCB);
            this.exTimeMin = param;
            this.bounesNum = PlayerDataMgr.getPlayerOffline(this.exTimeMin);
            this.bounesNumTriple = this.bounesNum * 3;
            this.initData();
            Laya.timer.once(200, this, () => {
                AdMgr.instance.showBanner();
            });
        }
        onClosed() {
            AdMgr.instance.hideBanner();
            if (localStorage.getItem('lastDate') && !WxApi.isShowAppBox && JJMgr.instance.dataConfig.front_box_ads) {
                WxApi.isShowAppBox = true;
                AdMgr.instance.showAppBox();
            }
        }
        initData() {
            this.coinNum.value = this.bounesNumTriple.toString();
            this.changePoint();
            this.changeBtn();
        }
        trippleBtnCB() {
            if (!this.updateCompleted)
                return;
            this.updateCompleted = false;
            this.isTripple = !this.isTripple;
            this.changePoint();
            this.changeBtn();
            Utility.updateNumber(this.bounesNum, 3, this.coinNum, false, this.isTripple, () => {
                this.updateCompleted = true;
            });
        }
        getBounesCB() {
            let cb = () => {
                if (this.isTripple)
                    WxApi.aldEvent('离线收益三倍：成功');
                PlayerDataMgr.changeCoin(this.isTripple ? this.bounesNumTriple : this.bounesNum);
                GameTopNode.Share.initData();
                this.close();
            };
            if (this.isTripple) {
                WxApi.aldEvent('离线收益三倍：点击');
                ShareMgr.instance.shareGame(cb);
            }
            else {
                cb();
            }
        }
        changePoint() {
            this.point.skin = this.isTripple ? 'offlineUI/lx-yuan.png' : 'offlineUI/lx-yuan2.png';
        }
        changeBtn() {
            this.noBtn.visible = !this.isTripple;
            this.trippleBtn.visible = this.isTripple;
        }
    }

    class OpenPacketsUI extends Laya.Scene {
        constructor() {
            super();
            this.openNode = this['openNode'];
            this.txNode = this['txNode'];
            this.closeOpenNodeBtn = this['closeOpenNodeBtn'];
            this.openBtn = this['openBtn'];
            this.tips = this['tips'];
            this.cashNode = this['cashNode'];
            this.coinNode = this['coinNode'];
            this.closeTxBtn = this['closeTxBtn'];
            this.cashNum = this['cashNum'];
            this.getCashNum = this['getCashNum'];
            this.tixianBtn = this['tixianBtn'];
            this.coinNum = this['coinNum'];
            this.getCoinBtn = this['getCoinBtn'];
            this.isGetCash = true;
            this.bounesNum = 0;
        }
        onOpened() {
            AdMgr.instance.hideBanner();
            AdMgr.instance.showBanner();
            this.openBtn.on(Laya.Event.CLICK, this, this.openBtnCB);
            this.closeOpenNodeBtn.on(Laya.Event.CLICK, this, this.closeCB);
            this.closeTxBtn.on(Laya.Event.CLICK, this, this.closeCB);
            this.tixianBtn.on(Laya.Event.CLICK, this, this.txBtnCB);
            this.getCoinBtn.on(Laya.Event.CLICK, this, this.getCoinBtnCB);
        }
        onClosed() {
            AdMgr.instance.hideBanner();
            if (GameLogic.Share.gameStarted && !GameLogic.Share.isFinishGame) {
                AdMgr.instance.showBanner();
            }
        }
        visibleOpenNode(vivible) {
            this.openNode.visible = vivible;
        }
        visibleTXNode(vivible) {
            this.txNode.visible = vivible;
        }
        openBtnCB() {
            let cb = () => {
                this.visibleOpenNode(false);
                this.visibleTXNode(true);
                let packetData = PlayerDataMgr.getPacketData();
                let videoCount = packetData.videoCount;
                console.log('packetData.curCash:', packetData.curCash);
                if (parseFloat(packetData.curCash.toFixed(2)) >= 1.8) {
                    this.isGetCash = false;
                }
                else {
                    if (videoCount < 3) {
                        this.isGetCash = true;
                    }
                    else {
                        let cashPer = JJMgr.instance.dataConfig.front_luckymoney_probability;
                        let randNum = Math.random() * 100;
                        this.isGetCash = randNum < cashPer;
                    }
                }
                if (this.isGetCash) {
                    let b = 0;
                    if (videoCount == 0) {
                        b = Math.random() * 0.1 + 0.4;
                        b = parseFloat(b.toFixed(2));
                    }
                    else if (videoCount == 1) {
                        b = Math.random() * 0.19 + 0.2;
                        b = parseFloat(b.toFixed(2));
                    }
                    else if (videoCount == 2) {
                        b = Math.random() * 0.19 + 0.2;
                        b = parseFloat(b.toFixed(2));
                    }
                    else if (videoCount >= 3) {
                        if (packetData.curCash >= 1.78) {
                            b = 2 - packetData.curCash;
                            b = parseFloat(b.toFixed(2));
                        }
                        else {
                            b = Math.random() * 0.05 + 0.1;
                            b = parseFloat(b.toFixed(2));
                        }
                    }
                    this.bounesNum = b;
                    if (this.bounesNum + PlayerDataMgr.getPacketData().curCash > 1.8) {
                        this.bounesNum = parseFloat((1.8 - PlayerDataMgr.getPacketData().curCash).toFixed(2));
                    }
                    this.gotCash();
                }
                else {
                    this.bounesNum = Math.floor(Math.random() * 200 + 100);
                    this.gotCoin();
                }
            };
            AdMgr.instance.showVideo(cb);
        }
        gotCash() {
            Laya.timer.once(500, this, () => {
                SoundMgr.instance.playSoundEffect('money.mp3');
            });
            this.cashNode.visible = true;
            this.coinNode.visible = false;
            PlayerDataMgr.getPacketData().videoCount++;
            PlayerDataMgr.getPacketData().curCash += parseFloat(this.bounesNum.toFixed(2));
            PlayerDataMgr.setPacketData();
            this.cashNum.text = PlayerDataMgr.getPacketData().curCash.toFixed(2) + '元';
            this.getCashNum.text = this.bounesNum.toFixed(2) + '元';
        }
        gotCoin() {
            Laya.timer.once(500, this, () => {
                SoundMgr.instance.playSoundEffect('getCoin.mp3');
            });
            PlayerDataMgr.changeCoin(this.bounesNum);
            this.cashNode.visible = false;
            this.coinNode.visible = true;
            this.coinNum.text = this.bounesNum.toString() + '金币';
        }
        txBtnCB() {
            this.close();
            Laya.Scene.open('MyScenes/TakeCashUI.scene', false);
        }
        getCoinBtnCB() {
            WxApi.OpenAlert('恭喜获得金币');
            this.closeCB();
        }
        closeCB() {
            this.close();
            WxApi.closePacketUICB && WxApi.closePacketUICB();
            WxApi.closePacketUICB = null;
        }
    }

    class SkinUIPlayer extends Laya.Script {
        constructor() {
            super();
            this.myOwner = null;
            this._ani = null;
            this.weaponNode = null;
            this.embNode = null;
            this.embScale = null;
            this.embPos = null;
            this.embRotation = null;
        }
        onAwake() {
            this.myOwner = this.owner;
            this._ani = this.owner.getComponent(Laya.Animator);
            this.playIdle1();
            this.weaponNode = Utility.findNodeByName(this.myOwner, 'Dummy_Arms');
            this.embNode = Utility.findNodeByName(this.myOwner, 'Dummy_Emb');
            let emb = Utility.findNodeByName(this.myOwner, 'Hero1_Emb');
            this.embScale = emb.transform.localScale.clone();
            this.embPos = emb.transform.localPosition.clone();
            this.embRotation = emb.transform.localRotation.clone();
            this.changeSkin(PlayerDataMgr.getPlayerData().playerId);
        }
        onDisable() {
        }
        playIdle1() {
            this._ani.crossFade("walk", 0.05);
            this._ani.crossFade("hit", 0.05, 1);
        }
        changeSkin(id) {
            let mats = new Laya.UnlitMaterial();
            Laya.Texture2D.load('res/skinHero/HeroD_' + (id + 1) + '.png', Laya.Handler.create(this, function (tex) {
                mats.albedoTexture = tex;
            }));
            for (let i = 1; i <= 4; i++) {
                let mesh3d = this.owner.getChildAt(i);
                mesh3d.skinnedMeshRenderer.material = mats;
            }
            this.embNode.destroyChildren();
            let embRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero' + (id + 1) + '_Emb.lh');
            let emb = Laya.Sprite3D.instantiate(embRes, this.embNode, false, new Laya.Vector3(0, 0, 0));
            emb.transform.localScale = this.embScale;
            emb.transform.localPosition = this.embPos;
            emb.transform.localRotation = this.embRotation;
        }
    }

    class SkinUI extends Laya.Scene {
        constructor() {
            super();
            this.topBar = this['topBar'];
            this.backBtn = this['backBtn'];
            this.coinNum = this['coinNum'];
            this.typePic = this['typePic'];
            this.itemNode = this['itemNode'];
            this.leftBtn = this['leftBtn'];
            this.rightBtn = this['rightBtn'];
            this.pointNode = this['pointNode'];
            this.btn1 = this['btn1'];
            this.btn2 = this['btn2'];
            this.btn3 = this['btn3'];
            this.pageIndex = 0;
            this.scene3D = null;
            this.light = null;
            this.camera = null;
            this.role = null;
            this.roleCrl = null;
        }
        onOpened(param) {
            this.backBtn.on(Laya.Event.CLICK, this, this.backBtnCB);
            this.leftBtn.on(Laya.Event.CLICK, this, this.turnPageCB, [true]);
            this.rightBtn.on(Laya.Event.CLICK, this, this.turnPageCB, [false]);
            this.leftBtn.visible = false;
            this.btn1.on(Laya.Event.CLICK, this, this.btnCB1);
            this.btn2.on(Laya.Event.CLICK, this, this.btnCB2);
            this.updateCoinNum();
            this.initData();
            this.init3DScene();
        }
        onClosed() {
        }
        init3DScene() {
            this.scene3D = Laya.stage.addChild(new Laya.Scene3D());
            this.light = this.scene3D.addChild(new Laya.DirectionLight());
            this.light.color = new Laya.Vector3(1, 0.956, 0.839);
            this.light.transform.rotate(new Laya.Vector3(59.3, -55.16, 0), true, false);
            this.camera = this.scene3D.addChild(new Laya.Camera(0, 0.1, 100));
            this.camera.transform.translate(new Laya.Vector3(0, 2, 7));
            this.camera.transform.rotate(new Laya.Vector3(-10, 0, 0), true, false);
            this.camera.clearFlag = Laya.BaseCamera.CLEARFLAG_DEPTHONLY;
            this.fixCameraField();
            let playerRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero_1.lh');
            this.role = Laya.Sprite3D.instantiate(playerRes, this.scene3D, false, new Laya.Vector3(0, 0, 0));
            this.role.transform.position = new Laya.Vector3(0, 2.6, 0);
            this.role.transform.rotationEuler = new Laya.Vector3(0, 0, 0);
            this.role.transform.setWorldLossyScale(new Laya.Vector3(0.5, 0.5, 0.5));
            this.roleCrl = this.role.addComponent(SkinUIPlayer);
        }
        fixCameraField() {
            let staticDT = 1624 - 1334;
            let curDT = Laya.stage.displayHeight - 1334 < 0 ? 0 : Laya.stage.displayHeight - 1334;
            let per = curDT / staticDT * 10;
            this.camera.fieldOfView += per;
        }
        initData() {
            this.typePic.skin = 'skinUI/pf-an' + (this.pageIndex + 1) + '.png';
            for (let i = 0; i < this.pointNode.numChildren; i++) {
                let p = this.pointNode.getChildAt(i);
                p.skin = i == this.pageIndex ? 'skinUI/pf-yuan2.png' : 'skinUI/pf-yuan1.png';
            }
            let coinNum = this.btn1.getChildAt(0);
            coinNum.text = PlayerDataMgr.getUnlockSkinCost().toString();
            this.btn1.visible = this.pageIndex == 0;
            this.btn2.visible = this.pageIndex == 1;
            this.btn3.visible = this.pageIndex == 2;
            this.initItem();
        }
        initItem() {
            for (let i = 0; i < this.itemNode.numChildren; i++) {
                let item = this.itemNode.getChildAt(i);
                let icon = item.getChildByName('icon');
                let tick = item.getChildByName('tick');
                item.off(Laya.Event.CLICK, this, this.itemCB);
                let index = i + this.pageIndex * 9;
                let isHave = PlayerDataMgr.getPlayerData().playerArr[index] >= 0;
                let skinArr = PlayerDataMgr.skinArr1;
                switch (this.pageIndex) {
                    case 0:
                        skinArr = PlayerDataMgr.skinArr1;
                        break;
                    case 1:
                        skinArr = PlayerDataMgr.skinArr2;
                        break;
                    case 2:
                        skinArr = PlayerDataMgr.skinArr3;
                        break;
                }
                if (i + 1 <= skinArr.length) {
                    icon.visible = isHave;
                    item.skin = isHave ? 'skinUI/pf-di2.png' : 'skinUI/pf-di.png';
                    if (isHave) {
                        icon.skin = 'heroSkins/Hero_' + (skinArr[i] + 1) + '.png';
                        item.on(Laya.Event.CLICK, this, this.itemCB, [index]);
                    }
                    tick.visible = isHave && PlayerDataMgr.getPlayerData().playerId == skinArr[i];
                }
                else {
                    tick.visible = false;
                    icon.visible = false;
                    item.skin = 'skinUI/pf-di.png';
                }
            }
        }
        itemCB(id) {
            PlayerDataMgr.getPlayerData().playerId = PlayerDataMgr.getPlayerData().playerArr[id];
            this.roleCrl.changeSkin(PlayerDataMgr.getPlayerData().playerId);
            GameLogic.Share.changePlayerSkin();
            this.initData();
        }
        updateCoinNum() {
            this.coinNum.value = PlayerDataMgr.getPlayerData().coin.toString();
            GameTopNode.Share.initData();
        }
        turnPageCB(isLeft) {
            if (isLeft) {
                this.pageIndex--;
            }
            else {
                this.pageIndex++;
            }
            this.leftBtn.visible = this.pageIndex > 0;
            this.rightBtn.visible = this.pageIndex < 2;
            this.initData();
        }
        btnCB1() {
            let skinArr = [].concat(PlayerDataMgr.getCoinSkins());
            if (skinArr.length <= 0) {
                WxApi.OpenAlert('敬请期待！');
                return;
            }
            WxApi.aldEvent('皮肤界面：金币解锁');
            let cost = PlayerDataMgr.getUnlockSkinCost();
            if (cost > PlayerDataMgr.getPlayerData().coin) {
                WxApi.OpenAlert('金币不足！');
                return;
            }
            WxApi.aldEvent('皮肤界面：金币解锁成功');
            PlayerDataMgr.getPlayerData().unlockSkinCount++;
            PlayerDataMgr.changeCoin(-cost);
            this.updateCoinNum();
            let value = Utility.getRandomItemInArr(skinArr);
            let skinId = PlayerDataMgr.skinArr1.indexOf(value);
            PlayerDataMgr.getPlayerSkin(skinId, value);
            this.roleCrl.changeSkin(PlayerDataMgr.getPlayerData().playerId);
            GameLogic.Share.changePlayerSkin();
            this.initData();
        }
        btnCB2() {
            let skinArr = [].concat(PlayerDataMgr.getVideoSkins());
            console.log(skinArr);
            if (skinArr.length <= 0) {
                WxApi.OpenAlert('敬请期待！');
                return;
            }
            WxApi.aldEvent('皮肤界面：视频/分享解锁');
            let cb = () => {
                WxApi.aldEvent('皮肤界面：视频/分享解锁成功');
                let value = Utility.getRandomItemInArr(skinArr);
                let skinId = PlayerDataMgr.skinArr2.indexOf(value) + 9;
                PlayerDataMgr.getPlayerSkin(skinId, value);
                this.roleCrl.changeSkin(PlayerDataMgr.getPlayerData().playerId);
                GameLogic.Share.changePlayerSkin();
                this.initData();
            };
            ShareMgr.instance.shareGame(cb);
        }
        backBtnCB() {
            this.scene3D.destroy();
            this.close();
        }
    }

    class TakeCashUI extends Laya.Scene {
        constructor() {
            super();
            this.curNum = this['curNum'];
            this.recordBtn = this['recordBtn'];
            this.closeBtn = this['closeBtn'];
            this.cashNode = this['cashNode'];
            this.takeCashBtn = this['takeCashBtn'];
            this.curSelectId = 0;
        }
        onOpened() {
            this.recordBtn.on(Laya.Event.CLICK, this, this.recordBtnCB);
            this.closeBtn.on(Laya.Event.CLICK, this, this.closeBtnCB);
            this.takeCashBtn.on(Laya.Event.CLICK, this, this.takeCashBtnCB);
            this.curNum.text = PlayerDataMgr.getPacketData().curCash.toFixed(2);
            for (let i = 0; i < this.cashNode.numChildren; i++) {
                let item = this.cashNode.getChildAt(i);
                item.on(Laya.Event.CLICK, this, this.clickItem, [i]);
            }
            this.clickItem(0);
        }
        onDisable() {
            WxApi.closePacketUICB && WxApi.closePacketUICB();
            WxApi.closePacketUICB = null;
        }
        clickItem(id) {
            for (let i = 0; i < this.cashNode.numChildren; i++) {
                let item = this.cashNode.getChildAt(i);
                if (i == id) {
                    item.skin = 'packetsUI/hb-kuang2.png';
                }
                else {
                    item.skin = 'packetsUI/hb-kuang.png';
                }
                this.curSelectId = id;
            }
        }
        recordBtnCB() {
            Laya.Scene.open('MyScenes/CashRecordUI.scene', false);
        }
        takeCashBtnCB() {
            WxApi.OpenAlert('余额不足');
        }
        closeBtnCB() {
            this.close();
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("View/BoxUI.ts", BoxUI);
            reg("Libs/FixAdShareIcon.ts", FixAdShareIcon);
            reg("Libs/FixNodeY.ts", FixNodeY);
            reg("View/CashRecordUI.ts", CashRecordUI);
            reg("View/FinishUI.ts", FinishUI);
            reg("View/FreeSkinUI.ts", FreeSkinUI);
            reg("View/GameUI.ts", GameUI);
            reg("View/GameTopNode.ts", GameTopNode);
            reg("View/KillBossUI.ts", KillBossUI);
            reg("View/LoadingUI.ts", LoadingUI);
            reg("View/OfflineUI.ts", OfflineUI);
            reg("View/OpenPacketsUI.ts", OpenPacketsUI);
            reg("View/SkinUI.ts", SkinUI);
            reg("View/TakeCashUI.ts", TakeCashUI);
            reg("Crl/FixAiTips.ts", FixAiTips);
        }
    }
    GameConfig.width = 750;
    GameConfig.height = 1334;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "vertical";
    GameConfig.alignV = "middle";
    GameConfig.alignH = "center";
    GameConfig.startScene = "MyScenes/LoadingUI.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            Laya.stage.useRetinalCanvas = true;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            new GameLogic();
        }
    }
    new Main();

}());
