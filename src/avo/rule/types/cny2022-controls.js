import Rule from '@avo/rule'
import { EXPECTED_TIMESTEP, PLAYER_ACTIONS } from '@avo/constants'

const MAX_PULSE = 1000

export default class CNY2022Controls extends Rule {
  constructor (app, cat, laserPointer) {
    super(app)
    this._type = 'cny2022-controls'

    this.cat = cat
    this.laserPointer = laserPointer

    this.laserTarget = null  // Where the laser pointer is trying to point to
    this.laserDot = null  // Where the laser dot actually appears

    this.pulseCounter = 0  // Animation counter for laser pulse
  }

  play (timeStep) {
    const app = this._app
    super.play(timeStep)
    this.updateLaser(timeStep)
    this.pointerPointsToTarget(timeStep)
    this.catChasesLaserDot(timeStep)

    this.pulseCounter = (timeStep + this.pulseCounter) % MAX_PULSE
  }

  updateLaser (timeStep) {
    const app = this._app
    if (app.playerAction === PLAYER_ACTIONS.POINTER_DOWN) {
      this.laserDot = app.playerInput.pointerCurrent
      this.laserTarget = app.playerInput.pointerCurrent
    }
  }

  pointerPointsToTarget (timeStep) {
    const laserPointer = this.laserPointer
    const laserTarget = this.laserTarget
    if (!laserPointer || !laserTarget) return

    const distX = laserTarget.x - laserPointer.x
    const distY = laserTarget.y - laserPointer.y
    const angleToTarget = Math.atan2(distY, distX)
    laserPointer.rotation = angleToTarget
  }

  catChasesLaserDot (timeStep) {
    const laserDot = this.laserDot
    const cat = this.cat

    if (!cat || !laserDot) return

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
    const laserPointer = this.laserPointer
    const laserDot = this.laserDot

    const laserSize = 3 + this.pulseFactor
    const dotSize = 16 + 4 * this.pulseFactor

    // Draw crosshair at mouse cursor
    c2d.beginPath()
    c2d.moveTo(laserPointer.x, laserPointer.y)
    c2d.lineTo(laserDot.x, laserDot.y)
    c2d.strokeStyle = 'rgba(255, 0, 0, 0.5)'
    c2d.lineWidth = laserSize
    c2d.stroke()

    c2d.fillStyle = '#f00'
    c2d.beginPath()
    c2d.arc(laserDot.x + camera.x, laserDot.y + camera.y, dotSize / 2, 0, 2 * Math.PI)
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
    const outerR = 64
    const innerR = 32

    // Draw crosshair at mouse cursor
    c2d.beginPath()
    c2d.moveTo(crosshairX - outerR, crosshairY)
    c2d.lineTo(crosshairX - innerR, crosshairY)
    c2d.moveTo(crosshairX + innerR, crosshairY)
    c2d.lineTo(crosshairX + outerR, crosshairY)
    c2d.moveTo(crosshairX, crosshairY - outerR)
    c2d.lineTo(crosshairX, crosshairY - innerR)
    c2d.moveTo(crosshairX, crosshairY + innerR)
    c2d.lineTo(crosshairX, crosshairY + outerR)
    c2d.strokeStyle = '#c88'
    c2d.lineWidth = 4
    c2d.stroke()
  }

  get pulseFactor () {
    return Math.sin((this.pulseCounter * Math.PI * 2)/ MAX_PULSE)
  }
}
