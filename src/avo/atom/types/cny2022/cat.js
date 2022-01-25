import Atom from '@avo/atom'
import { TILE_SIZE } from '@avo/constants'

/*
The Cat is the main character of the game, but the player doesn't control them
directly. Instead, the Cat wildly chases the laser pointer, causing chaos in
their wake.
 */
export default class Cat extends Atom {
  constructor (app, col = 0, row = 0) {
    super(app)
    this._type = 'cny2022-cat'

    this.colour = '#c44'
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2

    this._pushDeceleration = 0.2
  }
}
