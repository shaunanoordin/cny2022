import Atom from '@avo/atom'
import { TILE_SIZE, EXPECTED_TIMESTEP } from '@avo/constants'

const FRAGILITY = 0.5

export default class Vase extends Atom {
  constructor (app, col = 0, row = 0) {
    super(app)
    this._type = 'cny2022-vase'

    this.colour = '#48c'
    this.solid = true
    this.movable = true
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2

    this.prevPushX = 0
    this.prevPushY = 0

    this.broken = false
  }

  play (timeStep) {
    super.play(timeStep)

    const impulseX = this.pushX - this.prevPushX
    const impulseY = this.pushY - this.prevPushY
    const impulseSquared = (impulseX * impulseX + impulseY * impulseY) * this.mass * timeStep / (EXPECTED_TIMESTEP * 1000)

    this.prevPushX = this.pushX
    this.prevPushY = this.pushY

    if (impulseSquared > FRAGILITY) {
      this.break()
    }
  }

  break () {
    if (this.broken) return
    this.broken = true

    const victory = this._app.rules['cny2022-victory']
    if (victory) victory.score --

    this._expired = true
  }
}
