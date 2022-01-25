import Wall from '@avo/atom/types/wall'

export default class GlassWall extends Wall {
  constructor (app, col = 0, row = 0, width = 1, height = 1, cutCorner = false) {
    super(app, col, row, width, height, cutCorner)
    this._type = 'glass-wall'

    this.colour = 'rgba(128, 128, 128, 0.25)'
    this.transparent = true
  }
}
