import { PLAYER_ACTIONS, DIRECTIONS } from '@avo/constants'

import Hero from '@avo/atom/types/hero'
import Wall from '@avo/atom/types/wall'
import Ball from '@avo/atom/types/ball'
import Enemy from '@avo/atom/types/enemy'

import ZeldaControls from '@avo/rule/types/zelda-controls'
import CNY2022Controls from '@avo/rule/types/cny2022-controls'

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
  }

  load (level = 0) {
    const app = this._app
    this.current = level

    this.reset()
    this.generate_zelda_default()
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
}
