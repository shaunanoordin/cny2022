import Atom from '@avo/atom'
import { TILE_SIZE, EXPECTED_TIMESTEP } from '@avo/constants'
import { easeOut } from '@avo/misc'

const FRAGILITY = 0.15
const DECAY_MAX = 500

export default class Vase extends Atom {
  constructor (app, col = 0, row = 0) {
    super(app)
    this._type = 'cny2022-vase'

    this.colour = 'rgba(32, 32, 64, 0.5)'
    this.solid = true
    this.movable = true
    this.transparent = true
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2

    this.prevPushX = 0
    this.prevPushY = 0

    this.broken = false
    this.decayCounter = 0
  }

  play (timeStep) {
    super.play(timeStep)

    // If the object is broken, begin the decay process
    if (this.broken) {
      this.decayCounter = Math.min(this.decayCounter + timeStep, DECAY_MAX)
      if (this.decayCounter >= DECAY_MAX) this._expired = true
      return
    }

    // Calculate the impulse of the object
    // If the object is jolted too much (moves too much in a short amount of
    // time) then it breaks
    const impulseX = this.pushX - this.prevPushX
    const impulseY = this.pushY - this.prevPushY
    const impulseSquared = (impulseX * impulseX + impulseY * impulseY) * this.mass * timeStep / (EXPECTED_TIMESTEP * 1000)

    this.prevPushX = this.pushX
    this.prevPushY = this.pushY

    if (impulseSquared > FRAGILITY) {
      this.break()
    }
  }

  paint (layer = 0) {
    // super.paint(layer)

    const c2d = this._app.canvas2d
    const camera = this._app.camera
    const animationSpritesheet = this._app.assets.cny2022

    if (layer === 0 && !this.broken) {
      c2d.fillStyle = this.colour

      // Draw shadow
      c2d.beginPath()
      c2d.arc(Math.floor(this.x + camera.x), Math.floor(this.y + camera.y), this.size / 2, 0, 2 * Math.PI)
      c2d.closePath()
      c2d.fill()
    } else if (layer === 1) {
      if (!animationSpritesheet) return

      const SPRITE_SIZE = 96
      let SPRITE_OFFSET_X = 0
      let SPRITE_OFFSET_Y = -8

      const srcSizeX = SPRITE_SIZE
      const srcSizeY = SPRITE_SIZE
      let srcX = SPRITE_SIZE * 4
      let srcY = 0

      const tgtSizeX = SPRITE_SIZE * 1
      const tgtSizeY = SPRITE_SIZE * 1
      const tgtX = Math.floor(this.x + camera.x) - srcSizeX / 2 + SPRITE_OFFSET_X - (tgtSizeX - srcSizeX) / 2
      const tgtY = Math.floor(this.y + camera.y) - srcSizeY / 2 + SPRITE_OFFSET_Y - (tgtSizeY - srcSizeY) / 2

      if (this.broken) {
        const progress = this.decayCounter / DECAY_MAX
        if (progress < 0.33) srcY = SPRITE_SIZE * 1
        else if (progress < 0.67) srcY = SPRITE_SIZE * 2
        else srcY = SPRITE_SIZE * 3
      } else {
        srcY = 0
      }

      c2d.drawImage(animationSpritesheet.img, Math.floor(srcX), Math.floor(srcY), Math.floor(srcSizeX), Math.floor(srcSizeY), Math.floor(tgtX), Math.floor(tgtY), Math.floor(tgtSizeX), Math.floor(tgtSizeY))
    }
  }

  break () {
    if (this.broken) return
    this.broken = true

    const victory = this._app.rules['cny2022-victory']
    if (victory) victory.score --
  }
}
