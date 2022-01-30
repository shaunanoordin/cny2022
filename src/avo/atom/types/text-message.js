import Atom from '@avo/atom'
import { TILE_SIZE } from '@avo/constants'

/*
The TextMessage displays (non-interactable) text on the canvas.
Useful for having in-game instructions.
 */
export default class TextMessage extends Atom {
  constructor (app, text, col = 0, row = 0, layer = 0) {
    super(app)
    this._type = 'text-message'

    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2
    this.text = text
    this.layer = layer

    this.colour = 'rgba(0, 0, 0, 0.5)'
    this.font = '3em sans-serif'
    this.textBaseline = 'middle'
    this.textAlign = 'center'

    this.solid = false
    this.movable = false
  }

  paint (layer = 0) {
    // super.paint(layer)

    const c2d = this._app.canvas2d
    const camera = this._app.camera

    if (layer === this.layer) {
      c2d.font = this.font
      c2d.textBaseline = this.textBaseline
      c2d.textAlign = this.textAlign
      c2d.fillStyle = this.colour

      c2d.fillText(this.text, this.x, this.y)
    }
  }
}
