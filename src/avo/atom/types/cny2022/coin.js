import Atom from '@avo/atom'
import { TILE_SIZE } from '@avo/constants'
import { easeOut } from '@avo/misc'

const DECAY_MAX = 200
const SPIN_MAX = 1000

/*
Coins, when picked up by the Cat, increase the player's score.
 */
export default class Coin extends Atom {
  constructor (app, col = 0, row = 0) {
    super(app)
    this._type = 'cny2022-coin'

    this.size = TILE_SIZE
    this.colour = 'rgba(128, 92, 0, 0.5)'
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2

    this.solid = true
    this.movable = true
    this.transparent = true

    this.spinCounter = 0
    this.pickedUp = false
    this.decayCounter = 0
  }

  play (timeStep) {
    super.play(timeStep)

    if (!this.pickedUp) {  // If the coin hasn't been picked up, animate the spin!
      this.spinCounter = (this.spinCounter + timeStep) % SPIN_MAX

    } else {  // If the coin is picked up, begin the decay process
      this.decayCounter = Math.min(this.decayCounter + timeStep, DECAY_MAX)
      if (this.decayCounter >= DECAY_MAX) this._expired = true
    }
  }

  paint (layer = 0) {
    // super.paint(layer)

    const c2d = this._app.canvas2d
    const camera = this._app.camera
    const animationSpritesheet = this._app.assets.coin

    if (layer === 1) {
      if (!animationSpritesheet) return

      const SPRITE_SIZE = 64
      let SPRITE_OFFSET_X = 0
      let SPRITE_OFFSET_Y = -8

      const srcSizeX = SPRITE_SIZE
      const srcSizeY = SPRITE_SIZE
      let srcX = 0
      let srcY = 0

      const tgtSizeX = SPRITE_SIZE * 1
      const tgtSizeY = SPRITE_SIZE * 1
      const tgtX = Math.floor(this.x + camera.x) - srcSizeX / 2 + SPRITE_OFFSET_X - (tgtSizeX - srcSizeX) / 2
      const tgtY = Math.floor(this.y + camera.y) - srcSizeY / 2 + SPRITE_OFFSET_Y - (tgtSizeY - srcSizeY) / 2

      const progress = (!this.pickedUp)
        ? this.spinCounter / SPIN_MAX
        : this.decayCounter / DECAY_MAX

      if (!this.pickedUp) {
        if (progress < 0.25) srcY = SPRITE_SIZE * 0
        else if (progress < 0.5) srcY = SPRITE_SIZE * 1
        else if (progress < 0.75) srcY = SPRITE_SIZE * 2
        else srcY = SPRITE_SIZE * 3
      } else {
        srcX = SPRITE_SIZE * 1
        if (progress < 0.33) srcY = SPRITE_SIZE * 0
        else if (progress < 0.33) srcY = SPRITE_SIZE * 1
        else srcY = SPRITE_SIZE * 2
      }

      c2d.drawImage(animationSpritesheet.img, Math.floor(srcX), Math.floor(srcY), Math.floor(srcSizeX), Math.floor(srcSizeY), Math.floor(tgtX), Math.floor(tgtY), Math.floor(tgtSizeX), Math.floor(tgtSizeY))
    }
  }

  onCollision (target, collisionCorrection) {
    super.onCollision(target, collisionCorrection)

    if (this.pickedUp) return

    const app = this._app
    const cny2022 = app.rules['cny2022-controls']
    const victory = app.rules['cny2022-victory']

    if (!cny2022 || !victory) return

    if (target === cny2022.cat) {
      this.pickedUp = true
      victory.score ++
    }

  }
}
