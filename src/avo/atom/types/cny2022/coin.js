import Atom from '@avo/atom'
import { TILE_SIZE } from '@avo/constants'
import { easeOut } from '@avo/misc'

const DECAY_MAX = 200

/*
Coins, when picked up by the Cat, increase the player's score.
 */
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
    this.decayCounter = 0
  }

  play (timeStep) {
    super.play(timeStep)

    // If the coin is picked up, begin the decay process
    if (this.pickedUp) {
      this.decayCounter = Math.min(this.decayCounter + timeStep, DECAY_MAX)
      if (this.decayCounter >= DECAY_MAX) this._expired = true
      return
    }
  }

  paint (layer = 0) {
    if (this.pickedUp) {
      const progress = easeOut(this.decayCounter / DECAY_MAX)
      const c = 128 + progress * 128
      this.colour = `rgba(${c}, ${c}, ${c}, 1)`
    }
    super.paint(layer)
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
