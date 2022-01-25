import Rule from '@avo/rule'

const VICTORY_COUNTER_MAX = 500

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

export default class CNY2022Victory extends Rule {
  constructor (app, totalCoins = 0, totalBreakables = 0) {
    super(app)
    this._type = 'cny2022-victory'

    this.totalCoins = totalCoins
    this.totalBreakables = totalBreakables

    this.victory = false
    this.victoryCounter = 0
  }

  play (timeStep) {
    const app = this._app
    super.play(timeStep)

    if (this.victory) {
      this.victoryCounter = Math.min(this.victoryCounter + timeStep, VICTORY_COUNTER_MAX)

      if (this.victoryCounter >= VICTORY_COUNTER_MAX) app.paused = true
    }
  }

  paint (layer = 0) {
    if (layer !== 2) return
    if (!this.victory) return

    const app = this._app
    const c2d = this._app.canvas2d

    const TEXT = 'YOU DID IT!'
    const TEXT_X = app.canvasWidth / 2
    const TEXT_Y = app.canvasHeight / 2
    const TEXT_SIZE_START = 5
    const TEXT_SIZE_END = 10

    const progress = Math.min(this.victoryCounter / VICTORY_COUNTER_MAX, 1)  // returns 0.0 to 1.0
    const smoothedProgress = simpleEaseOut(progress)
    const textSize = (smoothedProgress * (TEXT_SIZE_END - TEXT_SIZE_START) + TEXT_SIZE_START).toFixed(2)
    c2d.font = `${textSize}em Source Code Pro`
    c2d.textAlign = 'center'
    c2d.textBaseline = 'middle'
    c2d.lineWidth = 8
    c2d.strokeStyle = '#fff'
    c2d.strokeText(TEXT, TEXT_X, TEXT_Y)
    c2d.fillStyle = '#c44'
    c2d.fillText(TEXT, TEXT_X, TEXT_Y)
  }

  triggerVictory () {
    if (this.victory) return  // Don't trigger more than once

    const app = this._app
    this.victory = true
  }
}
