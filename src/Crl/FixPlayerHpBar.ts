import Player from "./Player"
import GameLogic from "./GameLogic"

export default class FixPlayerHpBar extends Laya.Script {
    constructor() {
        super()
    }

    myOwner: Laya.ProgressBar
    playerNode: Laya.Sprite3D = null
    playerCrl: Player = null

    ready: boolean = false

    onAwake() {
        this.myOwner = this.owner as Laya.ProgressBar
    }

    onDisable() {

    }

    initData(node) {
        this.playerNode = node
        this.ready = true
        this.playerCrl = this.playerNode.getComponent(Player) as Player
    }

    onUpdate() {
        if (!this.ready) {
            return
        }
        if (this.playerNode.transform == null || this.playerNode.transform == undefined) {
            this.myOwner.destroy()
            return
        }

        this.myOwner.value = this.playerCrl.hp / this.playerCrl.hpMax

        let op: Laya.Vector4 = new Laya.Vector4(0, 0, 0)
        let hPos = this.playerNode.transform.position.clone()
        if (!this.playerCrl.isPlayer)
            hPos.y += 4
        else
            hPos.z -= 1
        GameLogic.Share._camera.viewport.project(hPos, GameLogic.Share._camera.projectionViewMatrix, op)
        this.myOwner.pos(op.x / Laya.stage.clientScaleX, op.y / Laya.stage.clientScaleY)
    }
}