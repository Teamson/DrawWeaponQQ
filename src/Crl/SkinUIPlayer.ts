import Utility from "../Mod/Utility"
import WxApi from "../Libs/WxApi"
import PlayerDataMgr from "../Libs/PlayerDataMgr"

export default class SkinUIPlayer extends Laya.Script {
    constructor() {
        super()
    }
    myOwner: Laya.Sprite3D = null
    _ani: Laya.Animator = null
    weaponNode: Laya.Sprite3D = null
    embNode: Laya.Sprite3D = null
    
    embScale = null
    embPos = null
    embRotation = null

    onAwake() {
        this.myOwner = this.owner as Laya.Sprite3D

        this._ani = this.owner.getComponent(Laya.Animator)
        this.playIdle1()

        this.weaponNode = Utility.findNodeByName(this.myOwner, 'Dummy_Arms')
        this.embNode = Utility.findNodeByName(this.myOwner, 'Dummy_Emb')
        let emb = Utility.findNodeByName(this.myOwner, 'Hero1_Emb')
        this.embScale = emb.transform.localScale.clone()
        this.embPos = emb.transform.localPosition.clone()
        this.embRotation = emb.transform.localRotation.clone()
        this.changeSkin(PlayerDataMgr.getPlayerData().playerId)
    }

    onDisable() {

    }

    playIdle1() {
        this._ani.crossFade("walk", 0.05);
        this._ani.crossFade("hit", 0.05, 1);
    }

    //切换皮肤
    changeSkin(id: number) {
        let mats = new Laya.UnlitMaterial();
        Laya.Texture2D.load('res/skinHero/HeroD_' + (id + 1) + '.png', Laya.Handler.create(this, function (tex) {
            mats.albedoTexture = tex;
        }))
        for (let i = 1; i <= 4; i++) {
            let mesh3d = this.owner.getChildAt(i) as Laya.SkinnedMeshSprite3D;
            mesh3d.skinnedMeshRenderer.material = mats;
        }

        this.embNode.destroyChildren()
        let embRes = Laya.loader.getRes(WxApi.UnityPath + 'Hero' + (id + 1) + '_Emb.lh') as Laya.Sprite3D
        let emb: Laya.Sprite3D = Laya.Sprite3D.instantiate(embRes, this.embNode, false, new Laya.Vector3(0, 0, 0));
        emb.transform.localScale = this.embScale
        emb.transform.localPosition = this.embPos
        emb.transform.localRotation = this.embRotation
    }
}