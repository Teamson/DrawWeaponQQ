import Player from "./Player"
import GameLogic from "./GameLogic"

export default class FixAiTips extends Laya.Script {
    constructor() {
        super()
    }

    myOwner: Laya.Image
    playerNode: Laya.Sprite3D = null
    playerCrl: Player = null

    ready: boolean = false

    onAwake() {
        this.myOwner = this.owner as Laya.Image
    }

    onDisable() {

    }

    initData(node) {
        this.playerNode = node
        this.playerCrl = this.playerNode.getComponent(Player) as Player
        this.ready = true

        Laya.timer.once(2000, this, () => { this.myOwner.destroy() })
    }

    onUpdate() {
        if (!this.ready) {
            return
        }
        if (this.playerNode.transform == null || this.playerNode.transform == undefined) {
            this.myOwner.destroy()
            return
        }

        let op: Laya.Vector4 = new Laya.Vector4(0, 0, 0)
        let hPos = this.playerNode.transform.position.clone()
        hPos.y += 3.5
        GameLogic.Share._camera.viewport.project(hPos, GameLogic.Share._camera.projectionViewMatrix, op)
        this.myOwner.pos(op.x / Laya.stage.clientScaleX, op.y / Laya.stage.clientScaleY)
    }
}