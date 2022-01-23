import Rule from '@avo/rule'
import { EXPECTED_TIMESTEP, PLAYER_ACTIONS } from '@avo/constants'

export default class CNY2022Controls extends Rule {
  constructor (app, cat, laserPointer) {
    super(app)
    this._type = 'cny2022-controls'

    this.cat = cat
    this.laserPointer = laserPointer

    this.laserTarget = null  // Where the laser pointer is trying to point to
    this.laserDot = null  // Where the laser dot actually appears
  }

  play (timeStep) {
    const app = this._app
    super.play(timeStep)
    this.updateLaserDot(timeStep)

    const pointer = this.laserDot
    const cat = this.cat

    if (cat && pointer) {
      const camera = app.camera
      const target = {
        x: pointer.x - camera.x,
        y: pointer.y - camera.y,
      }

      const distX = target.x - cat.x
      const distY = target.y - cat.y
      const angleToTarget = Math.atan2(distY, distX)
      const ACCELERATION = 1

      cat.rotation = angleToTarget
      cat.pushX += ACCELERATION * Math.cos(angleToTarget)
      cat.pushY += ACCELERATION * Math.sin(angleToTarget)
    }
  }

  updateLaserDot (timeStep) {
    const app = this._app
    if (app.playerAction === PLAYER_ACTIONS.POINTER_DOWN) {
      this.laserDot = app.playerInput.pointerCurrent
    }
  }

  catChasesLaserDot (timeStep) {
    const laserDot = this.laserDot
    const cat = this.cat
  }

  paint (layer = 0) {
    const c2d = this._app.canvas2d
    const camera = this._app.camera
    const pointer = this._app.playerInput.pointerCurrent

    if (layer === 1 && pointer) {
      const crosshairX = pointer.x
      const crosshairY = pointer.y
      const crosshairSize = 16
      const crosshairLeft = crosshairX - crosshairSize
      const crosshairRight = crosshairX + crosshairSize
      const crosshairTop = crosshairY - crosshairSize
      const crosshairBottom = crosshairY + crosshairSize

      // Draw crosshair at mouse cursor
      c2d.beginPath()
      c2d.moveTo(crosshairLeft, crosshairY)
      c2d.lineTo(crosshairRight, crosshairY)
      c2d.moveTo(crosshairX, crosshairTop)
      c2d.lineTo(crosshairX, crosshairBottom)
      c2d.strokeStyle = '#c88'
      c2d.lineWidth = 3
      c2d.stroke()
    }

    this.paintLaser()
  }

  paintLaser () {
    if (!this.laserDot) return

    const c2d = this._app.canvas2d
    const camera = this._app.camera
    const laserDot = this.laserDot
    const size = 8

      c2d.fillStyle = '#f00'
      c2d.strokeStyle = '#f00'

      c2d.beginPath()
      c2d.arc(laserDot.x + camera.x, laserDot.y + camera.y, size / 2, 0, 2 * Math.PI)
      c2d.closePath()
      c2d.fill()
  }
}
