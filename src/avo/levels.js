import {
  PLAYER_ACTIONS, DIRECTIONS, CNY2022_COLS, CNY2022_ROWS
} from '@avo/constants'

import Hero from '@avo/atom/types/hero'
import Wall from '@avo/atom/types/wall'
import Ball from '@avo/atom/types/ball'
import Enemy from '@avo/atom/types/enemy'

import Cat from '@avo/atom/types/cny2022/cat'
import LaserPointer from '@avo/atom/types/cny2022/laser-pointer'
import Goal from '@avo/atom/types/cny2022/goal'
import Coin from '@avo/atom/types/cny2022/coin'
import Vase from '@avo/atom/types/cny2022/vase'
import GlassWall from '@avo/atom/types/cny2022/glass-wall'

import ZeldaControls from '@avo/rule/types/zelda-controls'
import CNY2022Controls from '@avo/rule/types/cny2022-controls'
import CNY2022Victory from '@avo/rule/types/cny2022-victory'

export default class Levels {
  constructor (app) {
    this._app = app
    this.current = 0
  }

  reset () {
    const app = this._app
    app.hero = undefined
    app.atoms = []
    app.clearRules()
    app.camera = {
      target: null, x: 0, y: 0,
    }
    app.playerAction = PLAYER_ACTIONS.IDLE
    app.setInteractionMenu(false)
    app.paused = false
  }

  load (level = 0) {
    const app = this._app
    this.current = level

    this.reset()
    // this.generate_cny2022_default()
    this.generate_cny2022_level_1()
  }

  reload () {
    this.load(this.current)
  }

  /*
  Default top-down adventure level.
   */
  generate_zelda_default () {
    const app = this._app

    app.hero = new Hero(app, 11, 1)
    app.atoms.push(app.hero)
    app.camera.target = app.hero

    app.addRule(new ZeldaControls(app))
    // app.addRule(new CNY2022Controls(app))

    app.atoms.push(new Wall(app, 0, 0, 1, 23))  // West Wall
    app.atoms.push(new Wall(app, 22, 0, 1, 23))  // East Wall
    app.atoms.push(new Wall(app, 1, 0, 21, 1))  // North Wall
    app.atoms.push(new Wall(app, 1, 22, 21, 1))  // South Wall
    app.atoms.push(new Wall(app, 3, 2, 3, 1))
    app.atoms.push(new Wall(app, 3, 4, 3, 1))

    app.atoms.push(new Ball(app, 8, 6))

    const enemy = new Enemy(app, 4, 8)
    enemy.rotation = -45 / 180 * Math.PI
    app.atoms.push(enemy)
  }

  generate_cny2022_default () {
    const app = this._app

    const cat = new Cat(app, 3, 13)
    const laserPointer = new LaserPointer(app, (CNY2022_COLS - 1) / 2, CNY2022_ROWS - 3)
    app.atoms.push(cat)
    app.atoms.push(laserPointer)
    app.addRule(new CNY2022Controls(app, cat, laserPointer))

    this.createOuterWalls()
  }

  generate_cny2022_level_1 () {
    const app = this._app

    const cat = new Cat(app, 3, (CNY2022_ROWS - 1) / 2)
    const laserPointer = new LaserPointer(app, (CNY2022_COLS - 1) / 2, CNY2022_ROWS - 3)
    app.atoms.push(cat)
    app.atoms.push(laserPointer)
    app.addRule(new CNY2022Controls(app, cat, laserPointer))
    app.addRule(new CNY2022Victory(app))

    // Layout
    app.atoms.push(new Wall(app, 11, 6, 18, 1))
    app.atoms.push(new GlassWall(app, 11, 15, 18, 1))
    app.atoms.push(new GlassWall(app, 11, 16, 1, 3))
    app.atoms.push(new GlassWall(app, 28, 16, 1, 3))
    app.atoms.push(new Goal(app, CNY2022_COLS - 3, (CNY2022_ROWS - 1) / 2))

    // Coins
    app.atoms.push(new Coin(app, 11.5, 3))
    app.atoms.push(new Coin(app, 15.5, 3))
    app.atoms.push(new Coin(app, 19.5, 3))
    app.atoms.push(new Coin(app, 23.5, 3))
    app.atoms.push(new Coin(app, 27.5, 3))

    app.atoms.push(new Coin(app, 5.5, 14))
    app.atoms.push(new Coin(app, 3.5, 15.5))
    app.atoms.push(new Coin(app, 7.5, 15.5))
    app.atoms.push(new Coin(app, 4.5, 17.5))
    app.atoms.push(new Coin(app, 6.5, 17.5))

    // Vases
    app.atoms.push(new Vase(app, 11.5, 9.5))
    app.atoms.push(new Vase(app, 15.5, 9.5))
    app.atoms.push(new Vase(app, 19.5, 9.5))
    app.atoms.push(new Vase(app, 23.5, 9.5))
    app.atoms.push(new Vase(app, 27.5, 9.5))

    this.createOuterWalls()
  }

  createOuterWalls () {
    const app = this._app
    app.atoms.push(new Wall(app, 0, 0, CNY2022_COLS, 1))  // North Wall
    app.atoms.push(new Wall(app, 0, CNY2022_ROWS - 1, CNY2022_COLS, 1))  // South Wall
    app.atoms.push(new Wall(app, 0, 1, 1, CNY2022_ROWS - 2))  // West Wall
    app.atoms.push(new Wall(app, CNY2022_COLS - 1, 1, 1, CNY2022_ROWS - 2))  // East Wall
  }
}
