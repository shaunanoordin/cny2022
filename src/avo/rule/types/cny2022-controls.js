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
    this.updateLaser(timeStep)
    this.catChasesLaserDot(timeStep)
  }

  updateLaser (timeStep) {
    const app = this._app
    if (app.playerAction === PLAYER_ACTIONS.POINTER_DOWN) {
      this.laserDot = app.playerInput.pointerCurrent
      this.laserTarget = app.playerInput.pointerCurrent
    }
  }

  catChasesLaserDot (timeStep) {
    const laserDot = this.laserDot
    const cat = this.cat

    if (cat && laserDot) {
      const camera = this._app.camera
      const target = {
        x: laserDot.x - camera.x,
        y: laserDot.y - camera.y,
      }

      const distX = laserDot.x - cat.x
      const distY = laserDot.y - cat.y
      const angleToTarget = Math.atan2(distY, distX)
      const ACCELERATION = 1

      cat.rotation = angleToTarget
      cat.pushX += ACCELERATION * Math.cos(angleToTarget)
      cat.pushY += ACCELERATION * Math.sin(angleToTarget)
    }
  }

  paint (layer = 0) {
    if (layer === 1) {
      this.paintLaser()
      this.paintTarget()
    }
  }

  paintLaser () {
    if (!this.laserPointer || !this.laserDot) return

    const c2d = this._app.canvas2d
    const camera = this._app.camera
    const laserDot = this.laserDot
    const size = 16 + 4 * Math.random()

    c2d.fillStyle = '#f00'

    c2d.beginPath()
    c2d.arc(laserDot.x + camera.x, laserDot.y + camera.y, size / 2, 0, 2 * Math.PI)
    c2d.closePath()
    c2d.fill()
  }

  paintTarget () {
    if (!this.laserTarget) return

    const c2d = this._app.canvas2d
    const camera = this._app.camera
    const laserTarget = this.laserTarget

    const crosshairX = laserTarget.x - camera.x
    const crosshairY = laserTarget.y - camera.y
    const crosshairSize = 32
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
}
