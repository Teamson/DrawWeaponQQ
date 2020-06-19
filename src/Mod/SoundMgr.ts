export default class SoundMgr {
    private static _instance: SoundMgr
    public static get instance(): SoundMgr {
        if (!this._instance) {
            this._instance = new SoundMgr()
        }
        return this._instance
    }

    initLoading(fun: Function) {
        //预加载资源
        var resUrl: any[] = [
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
            { url: 'res/sounds/weaponReady.mp3', type: Laya.Loader.SOUND }
        ];
        Laya.loader.load(resUrl, Laya.Handler.create(this, fun));

        //跟随设备静音键 静音
        Laya.SoundManager.useAudioMusic = true
        //Laya.SoundManager.autoStopMusic = true
        Laya.SoundManager.setMusicVolume(1)
    }

    playMusic(str: string, loops: number = 0, cb?: Function) {
        Laya.SoundManager.playMusic('res/sounds/' + str, loops, new Laya.Handler(this, cb))
    }

    stopMusic() {
        Laya.SoundManager.stopMusic()
    }

    playSoundEffect(str: string, loops: number = 1, cb?: Function) {
        Laya.SoundManager.playSound('res/sounds/' + str, loops, new Laya.Handler(this, cb))
    }

}