import Atom from '@avo/atom'
import { PLAYER_ACTIONS, TILE_SIZE, EXPECTED_TIMESTEP } from '@avo/constants'

/*
The Laser Pointer is the origin of the laser beam.
 */
export default class LaserPointer extends Atom {
  constructor (app, col = 0, row = 0) {
    super(app)
    this._type = 'cny2022-laser-pointer'

    this.colour = '#c84'
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2
  }

  paint (layer = 0) {
    super.paint(layer)

    const c2d = this._app.canvas2d
    const camera = this._app.camera
    const animationSpritesheet = this._app.assets.cny2022
    if (!animationSpritesheet) return

    const SPRITE_SIZE = 96
    let SPRITE_OFFSET_X = 0
    let SPRITE_OFFSET_Y = 0

    const srcSizeX = SPRITE_SIZE
    const srcSizeY = SPRITE_SIZE
    let srcX = 0
    let srcY = 0

    // Paint the hands
    if (
      (this.rotation < 0 && layer === 1)
      || (this.rotation >= 0 && layer === 2)
    ) {
      SPRITE_OFFSET_Y = -8
      srcX = SPRITE_SIZE * 1
      srcY = SPRITE_SIZE * 2

      const tgtSizeX = SPRITE_SIZE
      const tgtSizeY = SPRITE_SIZE
      const tgtX = Math.floor(0) - srcSizeX / 2 + SPRITE_OFFSET_X - (tgtSizeX - srcSizeX) / 2
      const tgtY = Math.floor(0) - srcSizeY / 2 + SPRITE_OFFSET_Y - (tgtSizeY - srcSizeY) / 2

      c2d.translate(Math.floor(this.x + camera.x), Math.floor(this.y + camera.y))
      c2d.rotate(this.rotation - Math.PI / 2)
      c2d.drawImage(animationSpritesheet.img, Math.floor(srcX), Math.floor(srcY), Math.floor(srcSizeX), Math.floor(srcSizeY), Math.floor(tgtX), Math.floor(tgtY), Math.floor(tgtSizeX), Math.floor(tgtSizeY))
      c2d.setTransform(1, 0, 0, 1, 0, 0)  // Reset transform
    }

    if (layer === 1) {
      SPRITE_OFFSET_Y = -16
      srcX = SPRITE_SIZE * 1
      srcY = (this.rotation > 0)
        ? 0
        : SPRITE_SIZE * 1

      const tgtSizeX = SPRITE_SIZE
      const tgtSizeY = SPRITE_SIZE
      const tgtX = Math.floor(this.x + camera.x) - srcSizeX / 2 + SPRITE_OFFSET_X - (tgtSizeX - srcSizeX) / 2
      const tgtY = Math.floor(this.y + camera.y) - srcSizeY / 2 + SPRITE_OFFSET_Y - (tgtSizeY - srcSizeY) / 2

      c2d.drawImage(animationSpritesheet.img, Math.floor(srcX), Math.floor(srcY), Math.floor(srcSizeX), Math.floor(srcSizeY), Math.floor(tgtX), Math.floor(tgtY), Math.floor(tgtSizeX), Math.floor(tgtSizeY))
    }
  }
}
