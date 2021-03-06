import Utility from "./Utility";
import WxApi from "../Libs/WxApi";
import ShareMgr from "./ShareMgr";
import JJMgr from "../JJExport/Common/JJMgr";
import GameUI from "../View/GameUI";

export default class AdMgr {
    private static _instance: AdMgr
    public static get instance(): AdMgr {
        if (!this._instance) {
            this._instance = new AdMgr()
        }
        return this._instance
    }

    private bannerUnitId: string[] =
        ['66e1008c167595adbc5450df9686edb8', 'cda95c4ef7ef0a6bfe3390e79c3f3069', '947d377267bea06eb446afe81328d792', '8a7c0bf18bb869abc182b7110fd70145',
            '0570d3493da45e35547e61e32ee19b38', '176025b6749a637515faaf04b0272d52', '98be607366cb4d45b017c141d3667bce']
    private videoUnitId: string = '32351da471a086273478425fb7f99aab'
    private appBoxUnitId: string = 'e72c06906c7b12b06cfe70145816b8ed'
    private bannerAd: any = null
    private videoAd: any = null
    private blockAd: any = null
    public videoCallback: Function = null
    private curBannerId: number = 0
    public showBannerCount: number = 0
    public isBannerError: boolean = false
    private isLoaded: boolean = false

    private appBox: any = null

    private videoIsError: boolean = false
    private videoLoaded: boolean = false

    isCreateBAD: boolean = false

    initAd() {
        if (Laya.Browser.onWeiXin) {
            //this.initBanner()
            this.initVideo()
            //this.initAppBox()
        }
    }

    appBoxCloseCB: Function = null
    appBoxLoaded: boolean = false
    initAppBox(isShow: boolean = false) {
        if (Laya.Browser.onWeiXin) {
            let self = this
            this.appBoxLoaded = false
            this.appBox = Laya.Browser.window.qq.createAppBox({
                adUnitId: this.appBoxUnitId
            })
            this.appBox.load().then(() => {
                this.appBoxLoaded = true
                if (isShow) this.appBox.show()
            })
            this.appBox.offClose()
            this.appBox.onClose(() => {
                if (self.appBoxCloseCB != null && self.appBoxCloseCB) {
                    self.appBoxCloseCB()
                }
                self.closeAppBox()
            })
        }
    }

    showAppBox(cb?: Function) {
        this.appBoxCloseCB = cb
        if (Laya.Browser.onWeiXin && this.appBox && this.appBoxLoaded) {
            this.appBox.show()
        } else if (Laya.Browser.onWeiXin) {
            if (this.appBox) {
                this.appBox.destroy()
                this.appBox = null
            }
            this.initAppBox(true)
        }

        // if (Laya.Browser.onWeiXin) {
        //     this.showBanner()
        // }
    }

    closeAppBox() {
        if (Laya.Browser.onWeiXin && this.appBox) {
            this.appBox.destroy()
            this.appBox = null
            this.appBoxCloseCB = null

            //this.hideBanner()
        }
    }

    //初始化banner
    initBanner(isShow?: boolean) {
        this.isLoaded = false
        let winSize = Laya.Browser.window.qq.getSystemInfoSync()
        if (this.bannerAd) {
            this.bannerAd.offResize()
            this.bannerAd.offLoad()
            this.bannerAd.offError()
        }
        //初始化banner
        this.bannerAd = Laya.Browser.window.qq.createBannerAd({
            adUnitId: this.bannerUnitId[this.curBannerId],
            style: {
                left: 0,
                top: winSize.windowHeight,
                width: 750,
                height: 200
            }
        })
        //监听banner尺寸修正
        this.bannerAd.onResize(res => {
            this.bannerAd.style.top = winSize.windowHeight - res.height
            this.bannerAd.style.left = winSize.windowWidth / 2 - res.width / 2
        })
        this.bannerAd.onError(res => {
            // 错误事件
            console.log('banner error:', JSON.stringify(res))
        })
        this.bannerAd.onLoad(() => {
            this.isLoaded = true
            console.log('banner is loaded!')
            if (isShow)
                this.showBanner()
        })
    }
    //隐藏banner
    hideBanner() {
        if (Laya.Browser.onWeiXin && this.bannerAd) {
            console.log('hide banner!')
            this.bannerAd.hide()

            if (JJMgr.instance.dataConfig != null && this.showBannerCount >= parseInt(JJMgr.instance.dataConfig.front_banner_number)) {
                this.showBannerCount = 0
                this.curBannerId++
                if (this.curBannerId >= this.bannerUnitId.length) {
                    this.curBannerId = 0
                }

                this.destroyBanner()
            }
        }
    }

    //显示banner
    showBanner() {
        if (Laya.Browser.onWeiXin) {
            if (this.bannerAd && this.isLoaded) {
                this.showBannerCount++
                this.bannerAd.show()
            } else {
                if (this.bannerAd)
                    this.destroyBanner()
                this.initBanner(true)
            }
            console.log('showBanner :', this.showBannerCount)
        }
    }
    //销毁banner
    destroyBanner() {
        if (Laya.Browser.onWeiXin) {
            console.log('destroy banner')
            this.bannerAd.offResize()
            this.bannerAd.offLoad()
            this.bannerAd.offError()
            this.bannerAd.destroy()
            this.bannerAd = null
        }
    }

    initVideo() {
        if (!Laya.Browser.onWeiXin) {
            return
        }
        //初始化视频
        if (!this.videoAd) {
            this.videoAd = Laya.Browser.window.qq.createRewardedVideoAd({
                adUnitId: this.videoUnitId
            })
        }

        this.loadVideo()
        this.videoAd.onLoad(() => {
            console.log('激励视频加载成功')
            this.videoLoaded = true
        })
        //视频加载出错
        this.videoAd.onError(res => {
            console.log('video Error:', JSON.stringify(res))
            this.videoIsError = true
        })
    }

    loadVideo() {
        if (Laya.Browser.onWeiXin && this.videoAd != null) {
            this.videoIsError = false
            this.videoAd.load()
        }
    }

    //初始化激励视频
    showVideo(cb: Function) {
        this.videoCallback = cb
        if (!Laya.Browser.onWeiXin) {
            this.videoCallback()
            return
        }

        if (this.videoIsError) {
            ShareMgr.instance.shareGame(cb)
            this.loadVideo()
            return
        }

        if (this.videoLoaded == false) {
            WxApi.OpenAlert('视频正在加载中！')
            return
        }

        if (this.videoAd) {
            this.videoAd.offClose()
        }
        //关闭声音
        Laya.SoundManager.muted = true
        //监听关闭视频
        this.videoAd.onClose((res) => {
            if (res && res.isEnded || res === undefined) {
                console.log('正常播放结束，可以下发游戏奖励')
                this.videoCallback()
            }
            else {
                console.log('播放中途退出，不下发游戏奖励')
            }
            //恢复声音
            Laya.SoundManager.muted = false
            AdMgr.instance.loadVideo()
        })

        this.videoAd.show()
    }

}