import Atom from '@avo/atom'
import { TILE_SIZE } from '@avo/constants'

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
  }

  onCollision (target, collisionCorrection) {
    super.onCollision(target, collisionCorrection)

    const app = this._app
    const cny2022 = app.rules['cny2022-controls']
    if (!cny2022) return

    if (target === cny2022.cat) {
      app.paused = true
    }
  }
}
