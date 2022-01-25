import Rule from '@avo/rule'
import { EXPECTED_TIMESTEP, PLAYER_ACTIONS } from '@avo/constants'
import Physics from '@avo/physics'

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

    if (app.paused) return

    this.updateLaser()
    this.pointerPointsToTarget()
    this.catChasesLaserDot()

    this.pulseCounter = (timeStep + this.pulseCounter) % MAX_PULSE
  }

  /*
  Perform calculations for drawing a laser from the pointer to the target
   */
  updateLaser () {
    this.updateLaserTarget()
    this.updateLaserDot()
  }

  /*
  The target appears wherever the player clicks on the canvas.
   */
  updateLaserTarget () {
    const app = this._app
    if (app.playerAction === PLAYER_ACTIONS.POINTER_DOWN) {
      this.laserTarget = app.playerInput.pointerCurrent
      // TODO: offset camera coordinates?
    }
  }

  /*
  The laser dot attempts to appear where the laser target is, but can be
  interrupted by solid objects that appear between the target and the pointer.
   */
  updateLaserDot () {
    const app = this._app

    if (!this.laserTarget || !this.laserPointer) {
      this.laserDot = null
      return
    }

    // Intended line to the target.
    const lineToTarget = {
      start: {
        x: this.laserPointer.x,
        y: this.laserPointer.y,
      },
      end: {
        x: this.laserTarget.x,
        y: this.laserTarget.y,
      }
    }

    // For each atom, see if it intersects with the line to the target
    let closestIntersection = undefined
    app.atoms.forEach(atom => {

      // Ignore
      if (atom === this.laserPointer || atom === this.cat) return

      // Ignore transparent objects
      if (!atom.solid) return

      // Every atom has a "shape" that can be represented by a polygon.
      // (Yes, even circles.) Check each segment (aka edge aka side) of the
      // polygon.
      const vertices = atom.vertices
      if (vertices.length < 2) return
      for (let i = 0 ; i < vertices.length ; i++) {
        const segment = {
          start: {
            x: vertices[i].x,
            y: vertices[i].y,
          },
          end: {
            x: vertices[(i + 1) % vertices.length].x,
            y: vertices[(i + 1) % vertices.length].y,
          },
        }

        // Find the intersection point between the 'line to target' and the
        // current polygon segment. We want to find the intersection point (if
        // any) that's closest to the starting point of the 'line to target'.
        const intersection = Physics.getLineIntersection(lineToTarget, segment)
        if (!closestIntersection || (intersection && intersection.distanceFactor < closestIntersection.distanceFactor)) {
          closestIntersection = intersection
        }
      }
    })

    // Place the laser dot! If there's an intersection (i.e. an object is
    // blocking the 'line to target'), then the dot appears at the intersection.
    // Otherwise, it appears at the target as intended.
    this.laserDot = (closestIntersection) ? {
      x: closestIntersection.x,
      y: closestIntersection.y,
    } : {
      x: this.laserTarget.x,
      y: this.laserTarget.y,
    }
  }

  /*
  Rotate the laser pointer to the laser target.
   */
  pointerPointsToTarget () {
    const laserPointer = this.laserPointer
    const laserTarget = this.laserTarget
    if (!laserPointer || !laserTarget) return

    const distX = laserTarget.x - laserPointer.x
    const distY = laserTarget.y - laserPointer.y
    const angleToTarget = Math.atan2(distY, distX)
    laserPointer.rotation = angleToTarget
  }

  /*
  The cat chases the laser dot.
   */
  catChasesLaserDot () {
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

  /*
  Paint the laser (line from laser pointer to the laser dot). The laser
  represents what the cat actually chases.
   */
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

  /*
  Paint the laser target. This is where the player intends the laser to go.
   */
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
