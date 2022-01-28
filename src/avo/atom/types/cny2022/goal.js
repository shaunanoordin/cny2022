import Atom from '@avo/atom'
import { TILE_SIZE } from '@avo/constants'

const ANIMATION_MAX = 3000

/*
When the Cat touches the Goal, the level is complete.
 */
export default class Goal extends Atom {
  constructor (app, col = 0, row = 0) {
    super(app)
    this._type = 'cny2022-goal'

    this.size = TILE_SIZE * 2
    this.colour = 'rgba(128, 0, 0, 0.5)'
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2

    this.solid = false
    this.movable = false

    this.animationCounter = 0
  }

  onCollision (target, collisionCorrection) {
    super.onCollision(target, collisionCorrection)

    const app = this._app
    const cny2022 = app.rules['cny2022-controls']
    const victory = app.rules['cny2022-victory']

    if (!cny2022 || !victory) return

    if (target === cny2022.cat) victory.triggerVictory()
  }

  play (timeStep) {
    super.play(timeStep)

    this.animationCounter = (this.animationCounter + timeStep) % ANIMATION_MAX
  }

  paint (layer = 0) {
    //super.paint(layer)

    const c2d = this._app.canvas2d
    const camera = this._app.camera
    const animationSpritesheet = this._app.assets.cny2022

    if (layer === 1) {
      if (!animationSpritesheet) return

      const SPRITE_SIZE = 96
      let SPRITE_OFFSET_X = 0
      let SPRITE_OFFSET_Y = 0

      const srcSizeX = SPRITE_SIZE
      const srcSizeY = SPRITE_SIZE
      let srcX = SPRITE_SIZE * 5
      let srcY = 0

      const tgtSizeX = SPRITE_SIZE * 1.5
      const tgtSizeY = SPRITE_SIZE * 1.5
      const tgtX = Math.floor(this.x + camera.x) - srcSizeX / 2 + SPRITE_OFFSET_X - (tgtSizeX - srcSizeX) / 2
      const tgtY = Math.floor(this.y + camera.y) - srcSizeY / 2 + SPRITE_OFFSET_Y - (tgtSizeY - srcSizeY) / 2

      const progress = this.animationCounter / ANIMATION_MAX
      const p2 = Math.sin(progress*Math.PI)

      if (p2 < 0.25) srcY = SPRITE_SIZE * 3
      else if (p2 < 0.5) srcY = SPRITE_SIZE * 2
      else if (p2 < 0.75) srcY = SPRITE_SIZE * 1
      else srcY = SPRITE_SIZE * 0

      c2d.drawImage(animationSpritesheet.img, Math.floor(srcX), Math.floor(srcY), Math.floor(srcSizeX), Math.floor(srcSizeY), Math.floor(tgtX), Math.floor(tgtY), Math.floor(tgtSizeX), Math.floor(tgtSizeY))
    }
  }
}
