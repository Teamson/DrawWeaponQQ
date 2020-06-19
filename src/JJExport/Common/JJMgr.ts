import JJUtils from "./JJUtils"

export enum SceneDir {
    SCENE_FRIENDGAME = 'JJExport/FriendGameUI.scene',   //好友都在玩的爆款游戏弹窗
    SCENE_SCROLLUI = 'JJExport/ScrollUI.scene',         //游戏内滚动导出栏
    SCENE_RECOMMENDUI = 'JJExport/RecommendUI.scene',   //热门推荐全屏幕导出页
    SCENE_FULLGAMEUI = 'JJExport/FullGameUI.scene',     //全屏幕导出页
    SCENE_FINISHGAMEUI = 'JJExport/FinishGameUI.scene', //结算页 6 个 icon
    SCENE_DRAWUI = 'JJExport/DrawUI.scene',             //抽屉
    SCENE_NEWGAMEUI = 'JJExport/NewGameUI.scene',       //最新热门小游戏
    SCENE_PROGRAMUI = 'JJExport/ProgramUI.scene'        //游戏历史列表
}

export default class JJMgr {
    private static _instance: JJMgr
    public static get instance(): JJMgr {
        if (!this._instance) {
            this._instance = new JJMgr()
        }
        return this._instance
    }

    dataConfig: any = {
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
    }
    navDataArr: any[] = []

    JJConfigUrl: string = 'https://jiujiu.99huyu.cn/qq/weapon/config.json'

    isFinished: boolean = false

    /**是否显示全屏导出页 */
    canShowFullScreen(level): boolean {
        return level >= this.dataConfig.front_auto_remen_level;
    }

    /**
     * 初始化JJ导出 (建议尽早调用)
     * @param version 当前游戏版本
     * @param completeCB 初始化完成回调
     */
    initJJ(version: string = '1.0.0', completeCB?: Function) {
        JJUtils.httpRequest(this.JJConfigUrl, 'version=' + version, 'get', (res) => {
            res = JSON.parse(res)
            console.log('JJ config.json:', res)
            this.dataConfig = res.data.config
            //this.navDataArr = res.data.mores.remen_game
            this.isFinished = true
            completeCB && completeCB()
        })
    }

    /**
     * 打开导出场景
     * @param sceneDir 场景的路径名称 (全局枚举SceneDir)
     * @param closeOther 是否关闭其他界面
     * @param param 启动参数  
     * @param parent 设置父节点  
     * 启动参数包括 :
     * {
     * closeCallbackFun:()=>{},      关闭场景时的回调函数
     * continueCallbackFun:()=>{},   全屏导出界面点击 继续游戏 时的回调函数
     * grade:0,                      全屏导出界面点击 继续游戏 时grade>=后台参数 则弹出推荐导出
     * posY:1334,                    游戏内滚动导出栏 | 结算界面导出  的Y坐标
     * fixY:true,                    游戏内滚动导出栏 | 结算界面导出  是否需要适配屏幕高度
     * }
     */
    openScene(sceneDir: SceneDir, closeOther: boolean = false, param?: any, parent?: any) {
        Laya.Scene.open(sceneDir, closeOther, param, Laya.Handler.create(this, (v) => {
            if (parent) parent.addChild(v);
        }))
    }

    closeScene(sceneDir: SceneDir) {
        Laya.Scene.close(sceneDir)
    }

    //跳转
    NavigateApp(index: number, cancelCB?: Function, successCB?: Function, from?: SceneDir) {
        if (Laya.Browser.onWeiXin) {

            Laya.Browser.window.qq.aldSendEvent('导出-总点击数')
            switch (from) {
                case SceneDir.SCENE_DRAWUI:
                    Laya.Browser.window.qq.aldSendEvent('抽屉页面-总点击数')
                    break
                case SceneDir.SCENE_FINISHGAMEUI:
                    //Laya.Browser.window.qq.aldSendEvent('导出-总点击数')
                    break
                case SceneDir.SCENE_FRIENDGAME:
                    Laya.Browser.window.qq.aldSendEvent('好友都在玩的爆款游戏弹-总点击数')
                    break
                case SceneDir.SCENE_FULLGAMEUI:
                    Laya.Browser.window.qq.aldSendEvent('全屏幕导出页-总点击数')
                    break
                case SceneDir.SCENE_RECOMMENDUI:
                    Laya.Browser.window.qq.aldSendEvent('热门推荐全屏幕导出页-总点击数')
                    break
                case SceneDir.SCENE_SCROLLUI:
                    //Laya.Browser.window.qq.aldSendEvent('导出-总点击数')
                    break
                case SceneDir.SCENE_PROGRAMUI:
                    Laya.Browser.window.qq.aldSendEvent('游戏历史列表导出页-总点击数')
                    break
            }

            Laya.Browser.window.qq.navigateToMiniProgram({
                appId: this.navDataArr[index].appid,
                path: this.navDataArr[index].path,
                success: (res) => {
                    // 打开成功
                    successCB && successCB()
                    Laya.Browser.window.qq.aldSendEvent('导出成功-总用户数')
                    Laya.Browser.window.qq.aldSendEvent('导出成功-' + this.navDataArr[index].title)
                    console.log('导出成功-' + this.navDataArr[index].title)

                    switch (from) {
                        case SceneDir.SCENE_DRAWUI:
                            Laya.Browser.window.qq.aldSendEvent('抽屉页面-总成功跳转数')
                            break
                        case SceneDir.SCENE_FINISHGAMEUI:
                            //Laya.Browser.window.qq.aldSendEvent('导出-总点击数')
                            break
                        case SceneDir.SCENE_FRIENDGAME:
                            Laya.Browser.window.qq.aldSendEvent('好友都在玩的爆款游戏弹-总成功跳转数')
                            break
                        case SceneDir.SCENE_FULLGAMEUI:
                            Laya.Browser.window.qq.aldSendEvent('全屏幕导出页-总成功跳转数')
                            break
                        case SceneDir.SCENE_RECOMMENDUI:
                            Laya.Browser.window.qq.aldSendEvent('热门推荐全屏幕导出页-总成功跳转数')
                            break
                        case SceneDir.SCENE_SCROLLUI:
                            //Laya.Browser.window.qq.aldSendEvent('导出-总点击数')
                            break
                        case SceneDir.SCENE_PROGRAMUI:
                            Laya.Browser.window.qq.aldSendEvent('游戏历史列表导出页-总成功跳转数')
                            break
                    }
                },
                fail: (res) => {
                    // 打开失败
                    cancelCB && cancelCB()
                }
            })
        }
    }

    getTitle(index: number, sub: boolean = true) {
        if (sub) {
            if (this.navDataArr[index].subtitle && this.navDataArr[index].subtitle != '') {
                return this.navDataArr[index].subtitle
            } else {
                return this.navDataArr[index].title
            }
        } else {
            return this.navDataArr[index].title
        }
    }
}