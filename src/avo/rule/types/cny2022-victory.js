import Rule from '@avo/rule'
import { TILE_SIZE } from '@avo/constants'

const VICTORY_COUNTER_MAX = 500

/*
This Rule keeps track of scores and the victory condition.
- If the Cat touches a Coin, the score will increase.
- If a piece of Furniture is broken, the score will decrease.
- If the Cat touches the Goal, the player wins the level.
- If the player has won the level, play the victory message.
- The player should always be able to see their score
 */
export default class CNY2022Victory extends Rule {
  constructor (app) {
    super(app)
    this._type = 'cny2022-victory'

    this.victory = false  // bool: has the player finished the level?
    this.victoryCounter = 0

    this.score = 0
  }

  play (timeStep) {
    const app = this._app
    super.play(timeStep)

    if (this.victory) {
      this.victoryCounter = Math.min(this.victoryCounter + timeStep, VICTORY_COUNTER_MAX)

      if (this.victoryCounter >= VICTORY_COUNTER_MAX) app.paused = true
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
      const smoothedProgress = simpleEaseOut(progress)
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

function simpleEaseOut (x = 0) {
  const y = Math.min(Math.max(x, 0), 1)
  return y * (2 - y)
}

function simpleEaseIn (x = 0) {
  const y = Math.min(Math.max(x, 0), 1)
  return y * y
}

function simpleEaseInOut (x = 0) {
  const y = Math.min(Math.max(x, 0), 1)
  return y * y * (3 - 2 * y)
}
