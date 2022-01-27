import Atom from '@avo/atom'
import { TILE_SIZE } from '@avo/constants'

const ANIMATION_MAX = 1000

/*
The Cat is the main character of the game, but the player doesn't control them
directly. Instead, the Cat wildly chases the laser pointer, causing chaos in
their wake.
 */
export default class Cat extends Atom {
  constructor (app, col = 0, row = 0) {
    super(app)
    this._type = 'cny2022-cat'

    this.colour = 'rgba(64, 32, 32, 0.5)'
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2

    this._pushDeceleration = 0.2

    this.animationCounter = 0
  }

  play (timeStep) {
    super.play(timeStep)

    this.animationCounter = (this.animationCounter + timeStep) % ANIMATION_MAX
  }

  paint (layer = 0) {
    // super.paint(layer)

    const c2d = this._app.canvas2d
    const camera = this._app.camera
    const animationSpritesheet = this._app.assets.cny2022

    if (layer === 0) {
      c2d.fillStyle = this.colour
      c2d.strokeStyle = '#444'
      c2d.lineWidth = this.mass

      // Draw shape outline
      c2d.beginPath()
      c2d.arc(Math.floor(this.x + camera.x), Math.floor(this.y + camera.y), this.size / 2, 0, 2 * Math.PI)
      c2d.closePath()
      c2d.fill()
      // this.solid && c2d.stroke()
    } else if (layer === 1) {
      if (!animationSpritesheet) return

      const SPRITE_SIZE = 48
      let SPRITE_OFFSET_X = 0
      let SPRITE_OFFSET_Y = -32

      const srcSizeX = SPRITE_SIZE
      const srcSizeY = SPRITE_SIZE
      let srcX = 0
      let srcY = 0

      const tgtSizeX = SPRITE_SIZE * 2.5
      const tgtSizeY = SPRITE_SIZE * 2.5
      const tgtX = Math.floor(this.x + camera.x) - srcSizeX / 2 + SPRITE_OFFSET_X - (tgtSizeX - srcSizeX) / 2
      const tgtY = Math.floor(this.y + camera.y) - srcSizeY / 2 + SPRITE_OFFSET_Y - (tgtSizeY - srcSizeY) / 2

      const progress = this.animationCounter / ANIMATION_MAX
      if (this.pushSpeed === 0) {
        srcY = (progress < 0.5) ? SPRITE_SIZE * 0 : SPRITE_SIZE * 1
      } else {
        srcY = (progress < 0.5) ? SPRITE_SIZE * 2 : SPRITE_SIZE * 3
      }


      c2d.drawImage(animationSpritesheet.img, Math.floor(srcX), Math.floor(srcY), Math.floor(srcSizeX), Math.floor(srcSizeY), Math.floor(tgtX), Math.floor(tgtY), Math.floor(tgtSizeX), Math.floor(tgtSizeY))
    }
  }
}
