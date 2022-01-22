import Rule from '@avo/rule'
import { EXPECTED_TIMESTEP } from '@avo/constants'

/*
Standard player controls for top-down adventure games.
 */
export default class ZeldaControls extends Rule {
  constructor (app) {
    super(app)
    this._type = 'zelda-controls'
  }

  play (timeStep) {
    const app = this._app
    super.play(timeStep)

    if (app.hero) {
      const keysPressed = app.playerInput.keysPressed
      let intent = undefined
      let directionX = 0
      let directionY = 0

      if (keysPressed['ArrowRight']) directionX++
      if (keysPressed['ArrowDown']) directionY++
      if (keysPressed['ArrowLeft']) directionX--
      if (keysPressed['ArrowUp']) directionY--

      if (
        (keysPressed['x'] && !keysPressed['x'].acknowledged)
        || (keysPressed['X'] && !keysPressed['X'].acknowledged)
      ) {
        intent = {
          name: 'dash',
          directionX,
          directionY,
        }
        if (keysPressed['x']) keysPressed['x'].acknowledged = true
        if (keysPressed['X']) keysPressed['X'].acknowledged = true

      } else if (directionX || directionY) {
        intent = {
          name: 'move',
          directionX,
          directionY,
        }
      }

      app.hero.intent = intent
    }
  }
}
