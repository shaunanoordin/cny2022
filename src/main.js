import AvO from './avo'
import { CNY2022_COLS, CNY2022_ROWS, TILE_SIZE } from '@avo/constants'

var cny2022
window.onload = function() {
  window.cny2022 = new AvO({ width: CNY2022_COLS * TILE_SIZE, height: CNY2022_ROWS * TILE_SIZE })
}
