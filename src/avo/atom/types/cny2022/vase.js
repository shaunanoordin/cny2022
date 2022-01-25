import Atom from '@avo/atom'
import { TILE_SIZE, EXPECTED_TIMESTEP } from '@avo/constants'
import { easeOut } from '@avo/misc'

const FRAGILITY = 0.5
const DECAY_MAX = 500

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
    if (this.broken) {
      const progress = easeOut(this.decayCounter / DECAY_MAX)
      const c = 128 - progress * 128
      this.colour = `rgba(${c}, ${c}, ${c}, 1)`
    }
    super.paint(layer)
  }

  break () {
    if (this.broken) return
    this.broken = true

    const victory = this._app.rules['cny2022-victory']
    if (victory) victory.score --
  }
}
