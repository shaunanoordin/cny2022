import Atom from '@avo/atom'
import { TILE_SIZE, EXPECTED_TIMESTEP } from '@avo/constants'

const FRAGILITY = 0.5
const BREAKING_MAX = 1000

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
    this.breakingCounter = 0
  }

  play (timeStep) {
    super.play(timeStep)

    // If the object is broken, begin the decay process
    if (this.broken) {
      this.breakingCounter = Math.min(this.breakingCounter + timeStep, BREAKING_MAX)
      if (this.victoryCounter >= VICTORY_COUNTER_MAX) this._expired = true
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
    if (this.broken) {
      progress
    }

    super.paint(layer)
  }

  break () {
    if (this.broken) return
    this.broken = true

    const victory = this._app.rules['cny2022-victory']
    if (victory) victory.score --

    this._expired = true
  }
}
