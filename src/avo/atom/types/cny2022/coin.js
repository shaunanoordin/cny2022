import Atom from '@avo/atom'
import { TILE_SIZE } from '@avo/constants'

export default class Coin extends Atom {
  constructor (app, col = 0, row = 0) {
    super(app)
    this._type = 'cny2022-coin'

    this.size = TILE_SIZE
    this.colour = '#cc4'
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2

    this.solid = true
    this.movable = true
    this.transparent = true

    this.pickedUp = false
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
      this._expired = true
      victory.score ++
    }

  }
}
