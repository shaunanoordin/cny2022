import {
  PLAYER_ACTIONS, DIRECTIONS, CNY2022_COLS, CNY2022_ROWS
} from '@avo/constants'

import Hero from '@avo/atom/types/hero'
import Wall from '@avo/atom/types/wall'
import Ball from '@avo/atom/types/ball'
import Enemy from '@avo/atom/types/enemy'
import TextMessage from '@avo/atom/types/text-message'

import Cat from '@avo/atom/types/cny2022/cat'
import LaserPointer from '@avo/atom/types/cny2022/laser-pointer'
import Goal from '@avo/atom/types/cny2022/goal'
import Coin from '@avo/atom/types/cny2022/coin'
import Vase from '@avo/atom/types/cny2022/vase'
import GlassWall from '@avo/atom/types/cny2022/glass-wall'

import ZeldaControls from '@avo/rule/types/zelda-controls'
import CNY2022Controls from '@avo/rule/types/cny2022-controls'
import CNY2022Victory from '@avo/rule/types/cny2022-victory'

const CNY2022_HIGHSCORE_STORAGE_KEY = 'cny2022.highscores'

export default class Levels {
  constructor (app) {
    this._app = app
    this.current = 0

    this.cny2022LevelGenerators = [
      this.generate_cny2022_level_1.bind(this),
      this.generate_cny2022_level_2.bind(this),
      this.generate_cny2022_level_3.bind(this),
      this.generate_cny2022_level_4.bind(this),
      this.generate_cny2022_level_5.bind(this),
    ]
    this.cny2022HighScores = this.cny2022LevelGenerators.map(() => undefined)

    this.loadCNY2022HighScores()
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

    if (this.cny2022LevelGenerators[level]) {
      this.cny2022LevelGenerators[level]()
    }
  }

  reload () {
    this.load(this.current)
  }

  registerCNY2022Score (score) {
    const highscore = this.cny2022HighScores[this.current]

    if (highscore === undefined || highscore < score) {
      this.cny2022HighScores[this.current] = score
    }

    this.saveCNY2022HighScores()
  }

  saveCNY2022HighScores () {
    const storage = window?.localStorage
    if (!storage) return
    storage.setItem(CNY2022_HIGHSCORE_STORAGE_KEY, JSON.stringify(this.cny2022HighScores))
  }

  loadCNY2022HighScores () {
    const storage = window?.localStorage
    if (!storage) return
    try {
      const str = storage.getItem(CNY2022_HIGHSCORE_STORAGE_KEY)
      this.cny2022HighScores = (str) ? JSON.parse(str) : []
    } catch (err) {
      this.cny2022HighScores = []
      console.error(err)
    }
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
    const laserPointer = new LaserPointer(app, (CNY2022_COLS - 1) / 2, 3)
    app.atoms.push(cat)
    app.atoms.push(laserPointer)
    app.addRule(new CNY2022Controls(app, cat, laserPointer))
    app.addRule(new CNY2022Victory(app))

    // Layout
    app.atoms.push(new GlassWall(app, 11, 6, 18, 1))
    app.atoms.push(new GlassWall(app, 11, 1, 1, 5))
    app.atoms.push(new GlassWall(app, 28, 1, 1, 5))
    app.atoms.push(new Wall(app, 11, 13, 18, 1))
    app.atoms.push(new Goal(app, CNY2022_COLS - 3, (CNY2022_ROWS - 1) / 2))

    // Coins
    app.atoms.push(new Coin(app, 18, 11))
    app.atoms.push(new Coin(app, 21, 11))
    for (let i = 0 ; i < 4 ; i++) {
      app.atoms.push(new Coin(app, 15 + i * 3, 15))
      app.atoms.push(new Coin(app, 15 + i * 3, 17))
    }

    // Hints
    const hint1 = new TextMessage(app, '👆 Tap or click to aim laser', 19.5, 9, 0)
    const hint2 = new TextMessage(app, 'Get tiger to goal 🐅⬇️', 37.5, 7.5, 0)
    hint2.textAlign = 'right'
    const hint3 = new TextMessage(app, 'Coins add to score ➡️', 2, 16, 0)
    hint3.textAlign = 'left'
    app.atoms.push(hint1, hint2, hint3)

    this.createOuterWalls()
  }

  generate_cny2022_level_2 () {
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
    for (let i = 0 ; i < 5 ; i ++ ) {
      app.atoms.push(new Vase(app, 13.5 + i * 3, 8.5))
    }
    for (let i = 0 ; i < 3 ; i ++ ) {
      app.atoms.push(new Vase(app, 16.5 + i * 3, 11.5))
    }

    // Hints
    const hint1 = new TextMessage(app, '⬆️ Don\'t break vases!', 19.5, 13.5, 0)
    const hint2 = new TextMessage(app, 'Walls block lasers', 19.5, 6, 2)
    hint2.colour = 'rgba(255, 255, 255, 0.8)'
    app.atoms.push(hint1, hint2)

    this.createOuterWalls()
  }

  generate_cny2022_level_3 () {
    const app = this._app

    const cat = new Cat(app, 3, (CNY2022_ROWS - 1) / 2)
    const laserPointer = new LaserPointer(app, (CNY2022_COLS - 1) / 2, 6.5)
    app.atoms.push(cat)
    app.atoms.push(laserPointer)
    app.addRule(new CNY2022Controls(app, cat, laserPointer))
    app.addRule(new CNY2022Victory(app))

    // Layout
    this.createOuterWalls()
    app.atoms.push(new Wall(app, 1, 1, 3, 3, 'se'))  // North triangle
    app.atoms.push(new Wall(app, 36, 1, 3, 3, 'sw'))  // North triangle
    app.atoms.push(new Wall(app, 5, 5, 30, 1))  // North wall

    app.atoms.push(new GlassWall(app, 17, 6, 1, 2))  // Glass cage
    app.atoms.push(new GlassWall(app, 22, 6, 1, 2))  // Glass cage
    app.atoms.push(new GlassWall(app, 17, 8, 6, 1))  // Glass cage

    app.atoms.push(new Wall(app, 10, 14, 8, 1))  // South wall
    app.atoms.push(new Wall(app, 22, 14, 8, 1))  // South wall
    app.atoms.push(new Wall(app, 18, 12, 4, 1))  // South wall
    app.atoms.push(new Wall(app, 17, 12, 1, 2))  // South wall
    app.atoms.push(new Wall(app, 22, 12, 1, 2))  // South wall
    app.atoms.push(new Wall(app, 5, 14, 5, 5, 'nw'))
    app.atoms.push(new Goal(app, 19.5, 13.5))

    // Coins
    for (let i = 0 ; i < 6 ; i ++ ) {
      app.atoms.push(new Coin(app, 9.5 + i * 4, 2.5))
    }
    app.atoms.push(new Coin(app, 2.5, 16.5))
    app.atoms.push(new Coin(app, 11.5, 16.5))
    app.atoms.push(new Coin(app, 27.5, 16.5))
    app.atoms.push(new Coin(app, 36.5, 16.5))

    // Vases
    app.atoms.push(new Vase(app, 8, 9))
    app.atoms.push(new Vase(app, 12, 9))
    app.atoms.push(new Vase(app, 27, 9))
    app.atoms.push(new Vase(app, 31, 9))
    app.atoms.push(new Vase(app, 10, 12))
    app.atoms.push(new Vase(app, 29, 12))
  }

  generate_cny2022_level_4 () {
    const app = this._app

    const cat = new Cat(app, 19.5, 4.5)
    const laserPointer = new LaserPointer(app, 19.5, 9.5)
    app.atoms.push(cat)
    app.atoms.push(laserPointer)
    app.addRule(new CNY2022Controls(app, cat, laserPointer))
    app.addRule(new CNY2022Victory(app))
    this.createOuterWalls()

    app.atoms.push(new Goal(app, 19.5, 2))

    // Central cage
    app.atoms.push(new GlassWall(app, 18, 7, 4, 1))
    app.atoms.push(new GlassWall(app, 18, 12, 4, 1))
    app.atoms.push(new GlassWall(app, 17, 8, 1, 4))
    app.atoms.push(new GlassWall(app, 22, 8, 1, 4))
    app.atoms.push(new Wall(app, 18, 9.5, 0.5, 1))
    app.atoms.push(new Wall(app, 21.5, 9.5, 0.5, 1))
    app.atoms.push(new Wall(app, 19.5, 8, 1, 0.5))
    app.atoms.push(new Wall(app, 19.5, 11.5, 1, 0.5))
    app.atoms.push(new Vase(app, 19.5, 6))
    app.atoms.push(new Vase(app, 19.5, 13))
    app.atoms.push(new Vase(app, 16, 9.5))
    app.atoms.push(new Vase(app, 23, 9.5))

    // Left Side
    app.atoms.push(new Coin(app, 4, 3))
    app.atoms.push(new Coin(app, 4, 16))
    app.atoms.push(new Coin(app, 12, 6))
    app.atoms.push(new Coin(app, 12, 13))

    app.atoms.push(new Vase(app, 2, 5))
    app.atoms.push(new Vase(app, 2, 14))
    app.atoms.push(new Vase(app, 7, 7))
    app.atoms.push(new Vase(app, 7, 12))
    app.atoms.push(new Vase(app, 9, 16))

    app.atoms.push(new Wall(app, 2, 7, 1, 6))
    app.atoms.push(new Wall(app, 6, 9, 5, 1, 'ne'))
    app.atoms.push(new Wall(app, 6, 10, 5, 1, 'se'))

    // Middle
    app.atoms.push(new Coin(app, 19.5, 15))
    app.atoms.push(new Coin(app, 19.5, 17))

    // Right Side
    app.atoms.push(new Coin(app, 35, 3))
    app.atoms.push(new Coin(app, 35, 16))
    app.atoms.push(new Coin(app, 27, 6))
    app.atoms.push(new Coin(app, 27, 13))

    app.atoms.push(new Vase(app, 37, 5))
    app.atoms.push(new Vase(app, 37, 14))
    app.atoms.push(new Vase(app, 32, 7))
    app.atoms.push(new Vase(app, 32, 12))
    app.atoms.push(new Vase(app, 30, 16))

    app.atoms.push(new Wall(app, 37, 7, 1, 6))
    app.atoms.push(new Wall(app, 29, 9, 5, 1, 'nw'))
    app.atoms.push(new Wall(app, 29, 10, 5, 1, 'sw'))
  }

  generate_cny2022_level_5 () {
    const app = this._app

    const cat = new Cat(app, 19.5, 17)
    const laserPointer = new LaserPointer(app, 19.5, 1.5)
    // const laserPointer = new LaserPointer(app, 37.5, 1.5)
    app.atoms.push(cat)
    app.atoms.push(laserPointer)
    app.addRule(new CNY2022Controls(app, cat, laserPointer))
    app.addRule(new CNY2022Victory(app))
    this.createOuterWalls()

    // North Wall
    app.atoms.push(new GlassWall(app, 4, 3, 35, 1))

    // West Wall
    app.atoms.push(new GlassWall(app, 4, 7, 1, 9))
    app.atoms.push(new Coin(app, 2, 11))

    // Eastern Maze
    app.atoms.push(new Wall(app, 32, 4, 1, 9))  // East wall
    app.atoms.push(new GlassWall(app, 32, 16, 1, 3))  // East wall
    app.atoms.push(new GlassWall(app, 33, 6, 4, 1))  // East maze 1
    app.atoms.push(new GlassWall(app, 35, 9, 4, 1))  // East maze 2
    app.atoms.push(new GlassWall(app, 33, 12, 4, 1))  // East maze 3
    app.atoms.push(new Goal(app, 35.5, 17))
    app.atoms.push(new Coin(app, 35.5, 4.5))
    app.atoms.push(new Coin(app, 35.5, 7.5))
    app.atoms.push(new Coin(app, 35.5, 10.5))

    // Middle maze
    app.atoms.push(new GlassWall(app, 8, 7, 9, 1))
    app.atoms.push(new GlassWall(app, 8, 11, 9, 1))
    app.atoms.push(new GlassWall(app, 8, 15, 9, 1))
    app.atoms.push(new GlassWall(app, 23, 9, 5, 1))
    app.atoms.push(new GlassWall(app, 23, 13, 5, 1))
    app.atoms.push(new Vase(app, 18, 7))
    app.atoms.push(new Vase(app, 18, 11))
    app.atoms.push(new Vase(app, 18, 15))
    app.atoms.push(new Vase(app, 21, 9))
    app.atoms.push(new Vase(app, 21, 13))
    app.atoms.push(new Coin(app, 12, 5))
    app.atoms.push(new Coin(app, 12, 9))
    app.atoms.push(new Coin(app, 12, 13))
    app.atoms.push(new Coin(app, 25, 7))
    app.atoms.push(new Coin(app, 25, 11))
    app.atoms.push(new Coin(app, 25, 15))
  }

  createOuterWalls () {
    const app = this._app
    app.atoms.push(new Wall(app, 0, 0, CNY2022_COLS, 1))  // North Wall
    app.atoms.push(new Wall(app, 0, CNY2022_ROWS - 1, CNY2022_COLS, 1))  // South Wall
    app.atoms.push(new Wall(app, 0, 1, 1, CNY2022_ROWS - 2))  // West Wall
    app.atoms.push(new Wall(app, CNY2022_COLS - 1, 1, 1, CNY2022_ROWS - 2))  // East Wall
  }
}
