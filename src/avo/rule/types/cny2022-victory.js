import Rule from '@avo/rule'
import { TILE_SIZE } from '@avo/constants'
import { easeOut } from '@avo/misc'

const VICTORY_COUNTER_MAX = 500
const RETURN_TO_HOME_MENU_COUNTER_MAX = 1500

/*
This Rule keeps track of scores and the victory condition.
- If the Cat touches a Coin, the score will increase.
- If a Vase is broken, the score will decrease.
- If the Cat touches the Goal, the player wins the level.
- If the player has won the level, play the victory message.
- The player should always be able to see their score
 */
export default class CNY2022Victory extends Rule {
  constructor (app) {
    super(app)
    this._type = 'cny2022-victory'

    // Once the player has finished the level, show the victory message over a
    // period of time, and then pause the gameplay.
    this.victory = false  // bool: has the player finished the level?
    this.victoryCounter = 0

    // Once the player has seen the victory message, wait a moment before
    // opening the home menu. (The home menu should only be opened automatically
    // ONCE.)
    this.returnToHomeMenuCounter = 0
    this.returnedToHomeMenu = false  // bool: has the home menu been opened?

    this.score = 0
  }

  play (timeStep) {
    const app = this._app
    super.play(timeStep)

    // If the cat has reached the exit, run the victory phase.
    if (this.victory) {
      this.victoryCounter = Math.min(this.victoryCounter + timeStep, VICTORY_COUNTER_MAX)

      // Victory phase part 1: show the victory message over a period of time,
      // and after that pause the game.
      if (this.victoryCounter >= VICTORY_COUNTER_MAX) {
        app.paused = true

        this.returnToHomeMenuCounter = Math.min(this.returnToHomeMenuCounter + timeStep, RETURN_TO_HOME_MENU_COUNTER_MAX)

        // Victory phase part 2: once the victory message has finished playing,
        // wait a moment and then open the home menu again. Note that the home
        // menu should only be opened automatically ONCE.
        if (this.returnToHomeMenuCounter >= RETURN_TO_HOME_MENU_COUNTER_MAX && !this.returnedToHomeMenu) {
          this.returnedToHomeMenu = true
          app.setHomeMenu(true)
        }
      }
    }
  }

  /*
  Paint the score and/or victory screen
  - Paint the victory screen, if the player has won the level
  - Paint the score on the top layer
   */
  paint (layer = 0) {
    if (layer !== 2) return

    const app = this._app
    const c2d = this._app.canvas2d

    // Victory message
    if (this.victory) {
      const VICTORY_TEXT = 'YOU DID IT!'
      const VICTORY_X = app.canvasWidth / 2
      const VICTORY_Y = app.canvasHeight / 2
      const VICTORY_SIZE_START = 5
      const VICTORY_SIZE_END = 10

      // Paint victory text
      const progress = Math.min(this.victoryCounter / VICTORY_COUNTER_MAX, 1)  // returns 0.0 to 1.0
      const smoothedProgress = easeOut(progress)
      const textSize = (smoothedProgress * (VICTORY_SIZE_END - VICTORY_SIZE_START) + VICTORY_SIZE_START).toFixed(2)
      const blockOpacity = smoothedProgress * 0.5

      c2d.fillStyle = `rgba(128, 128, 128, ${blockOpacity})`
      c2d.fillRect(0, 0, app.canvasWidth, app.canvasHeight)

      c2d.font = `${textSize}em Source Code Pro`
      c2d.textAlign = 'center'
      c2d.textBaseline = 'middle'
      c2d.lineWidth = 8
      c2d.strokeStyle = '#eee'
      c2d.strokeText(VICTORY_TEXT, VICTORY_X, VICTORY_Y)
      c2d.fillStyle = '#c44'
      c2d.fillText(VICTORY_TEXT, VICTORY_X, VICTORY_Y)
    }

    // Score
    const SCORE_TEXT = `${this.score} points`
    const SCORE_X = app.canvasWidth - TILE_SIZE * 1
    const SCORE_Y = app.canvasHeight - TILE_SIZE * 0.1

    c2d.font = `3em sans-serif`
    c2d.textAlign = 'right'
    c2d.textBaseline = 'bottom'
    c2d.lineWidth = 8
    c2d.strokeStyle = '#eee'
    c2d.strokeText(SCORE_TEXT, SCORE_X, SCORE_Y)
    c2d.fillStyle = '#ca4'
    c2d.fillText(SCORE_TEXT, SCORE_X, SCORE_Y)
  }

  /*
  Triggers the victory for the level. Usually called by Goal Atom.
   */
  triggerVictory () {
    if (this.victory) return  // Don't trigger more than once

    const app = this._app
    this.victory = true
  }
}
