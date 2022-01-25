import Atom from '@avo/atom'
import { PLAYER_ACTIONS, TILE_SIZE, EXPECTED_TIMESTEP } from '@avo/constants'

export default class LaserPointer extends Atom {
  constructor (app, col = 0, row = 0) {
    super(app)
    this._type = 'cny2022-laser-pointer'

    this.colour = '#c84'
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2
  }
}
