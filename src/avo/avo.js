import {
  TILE_SIZE,
  PLAYER_ACTIONS, SHAPES,
  ACCEPTABLE_INPUT_DISTANCE_FROM_HERO,
  MAX_PULL_DISTANCE,
} from '@avo/constants'
import Physics from '@avo/physics'
import Levels from '@avo/levels'
import ImageAsset from '@avo/image-asset'
import JsonAsset from '@avo/json-asset'
import Interaction from '@avo/interaction'

const searchParams = new URLSearchParams(window.location.search)
const DEBUG = searchParams.get('debug') || false
const STARTING_LEVEL = (Number.isInteger(parseInt(searchParams.get('level'))))
  ? parseInt(searchParams.get('level')) - 1
  : 0

export default class AvO {
  constructor (args = {}) {
    const {
      width = 24 * TILE_SIZE,  // Canvas width
      height = 16 * TILE_SIZE,  // Canvas height
    } = args

    this.html = {
      main: document.getElementById('main'),
      canvas: document.getElementById('canvas'),
      homeMenu: document.getElementById('home-menu'),
      interactionMenu: document.getElementById('interaction-menu'),
      buttonHome: document.getElementById('button-home'),
      buttonFullscreen: document.getElementById('button-fullscreen'),
      buttonReload: document.getElementById('button-reload'),
    }

    this.homeMenu = false
    this.setHomeMenu(false)

    this.interactionMenu = false
    this.setInteractionMenu(false)

    this.canvas2d = this.html.canvas.getContext('2d')
    this.canvasWidth = width
    this.canvasHeight = height

    this.camera = {
      target: null,  // Target atom to follow. If null, camera is static.
      x: 0,
      y: 0,
    }

    this.setupUI()

    this.initialised = false
    this.assets = {
      "exampleImage": new ImageAsset('assets/simple-bg.png'),
      "exampleJson": new JsonAsset('assets/example.json'),
    }
    this.secretAssets = {
      // "secretImage": new ImageAsset('secrets/simple-bg.png'),
      // "secretJson": new JsonAsset('secrets/example.json'),
    }

    this.hero = null
    this.atoms = []
    this.rules = {}
    this.levels = new Levels(this)

    this.playerAction = PLAYER_ACTIONS.IDLE
    this.playerInput = {
      // Mouse/touchscreen input
      pointerStart: undefined,
      pointerCurrent: undefined,
      pointerEnd: undefined,

      // Keys that are currently being pressed.
      // keysPressed = { key: { duration, acknowledged } }
      keysPressed: {},
    }

    this.prevTime = null
    this.nextFrame = window.requestAnimationFrame(this.main.bind(this))
  }

  initialisationCheck () {
    // Assets check
    let allAssetsReady = true
    let numReadyAssets = 0
    let numTotalAssets = 0
    Object.keys(this.assets).forEach((id) => {
      const asset = this.assets[id]
      allAssetsReady = allAssetsReady && asset.ready
      if (asset.ready) numReadyAssets++
      numTotalAssets++
    })
    Object.keys(this.secretAssets).forEach((id) => {
      const secretAsset = this.secretAssets[id]
      const secretAssetIsReady = secretAsset.ready || secretAsset.error
      allAssetsReady = allAssetsReady && secretAssetIsReady
      if (secretAssetIsReady) numReadyAssets++
      numTotalAssets++
    })

    // Paint status
    this.canvas2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.canvas2d.textAlign = 'start'
    this.canvas2d.textBaseline = 'top'
    this.canvas2d.fillStyle = '#ccc'
    this.canvas2d.font = `1em monospace`
    this.canvas2d.fillText(`Loading ${numReadyAssets} / ${numTotalAssets} `, TILE_SIZE, TILE_SIZE)

    if (allAssetsReady) {
      // Clean up secret assets
      Object.keys(this.secretAssets).forEach((id) => {
        if (this.secretAssets[id].error) delete this.secretAssets[id]
      })

      // Let's go!
      this.initialised = true
      this.showUI()
      this.levels.load(STARTING_LEVEL)
    }
  }

  /*
  Section: General Logic
  ----------------------------------------------------------------------------
   */

  main (time) {
    const timeStep = (this.prevTime) ? time - this.prevTime : time
    this.prevTime = time

    if (this.initialised) {
      this.play(timeStep)
      this.paint()
    } else {
      this.initialisationCheck()
    }

    this.nextFrame = window.requestAnimationFrame(this.main.bind(this))
  }

  play (timeStep) {
    // If a menu is open, pause all action gameplay
    if (this.homeMenu || this.interactionMenu) return

    // Run the action gameplay
    // ----------------
    this.atoms.forEach(atom => atom.play(timeStep))
    for (const id in this.rules) { this.rules[id].play(timeStep) }
    this.checkCollisions(timeStep)

    // Cleanup
    this.atoms = this.atoms.filter(atom => !atom._expired)
    for (const id in this.rules) {
      if (this.rules[id]._expired) delete this.rules[id]
    }
    // ----------------

    // Increment the duration of each currently pressed key
    Object.keys(this.playerInput.keysPressed).forEach(key => {
      if (this.playerInput.keysPressed[key]) this.playerInput.keysPressed[key].duration += timeStep
    })
  }

  /*
  Draw a line of sight (cast a ray) starting from the hero, in the direction
  of they are facing.
   */
  paintLineOfSight () {
    if (!this.hero) return
    const hero = this.hero
    const c2d = this.canvas2d
    const camera = this.camera

    const MAX_LINE_OF_SIGHT_DISTANCE = 320

    // Intended line of sight, i.e. a ray starting from the hero.
    const lineOfSight = {
      start: {
        x: hero.x,
        y: hero.y,
      },
      end: {
        x: hero.x + MAX_LINE_OF_SIGHT_DISTANCE * Math.cos(hero.rotation),
        y: hero.y + MAX_LINE_OF_SIGHT_DISTANCE * Math.sin(hero.rotation),
      }
    }

    let actualLineOfSightEndPoint = undefined

    // For each atom, see if it intersects with the hero's LOS
    this.atoms.forEach(atom => {
      if (atom === hero) return

      // TODO: check for opaqueness and/or if the atom is visible.

      const vertices = atom.vertices
      if (vertices.length < 2) return

      // Every atom has a "shape" that can be represented by a polygon.
      // (Yes, even circles.) Check each segment (aka edge aka side) of the
      // polygon.
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

        // Find the intersection. We want to find the intersection point
        // closest to the hero (the LOS ray's starting point).
        const intersection = Physics.getLineIntersection(lineOfSight, segment)
        if (!actualLineOfSightEndPoint || (intersection && intersection.distanceFactor < actualLineOfSightEndPoint.distanceFactor)) {
          actualLineOfSightEndPoint = intersection
        }
      }
    })

    if (!actualLineOfSightEndPoint) {
      actualLineOfSightEndPoint = {
        x: hero.x + MAX_LINE_OF_SIGHT_DISTANCE* Math.cos(hero.rotation),
        y: hero.y + MAX_LINE_OF_SIGHT_DISTANCE * Math.sin(hero.rotation),
      }
    }

    // Expected line of sight
    c2d.beginPath()
    c2d.moveTo(lineOfSight.start.x + camera.x, lineOfSight.start.y + camera.y)
    c2d.lineTo(lineOfSight.end.x + camera.x, lineOfSight.end.y + camera.y)
    c2d.closePath()
    c2d.strokeStyle = '#c88'
    c2d.lineWidth = 3
    c2d.setLineDash([5, 5])
    c2d.stroke()
    c2d.setLineDash([])

    // Actual line of sight
    c2d.beginPath()
    c2d.moveTo(lineOfSight.start.x + camera.x, lineOfSight.start.y + camera.y)
    c2d.lineTo(actualLineOfSightEndPoint.x + camera.x, actualLineOfSightEndPoint.y + camera.y)
    c2d.closePath()
    c2d.strokeStyle = '#39f'
    c2d.lineWidth = 3
    c2d.stroke()

    // Expected end of line of sight
    c2d.beginPath()
    c2d.arc(lineOfSight.end.x + camera.x, lineOfSight.end.y + camera.y, 4, 0, 2 * Math.PI)
    c2d.closePath()
    c2d.fillStyle = '#c88'
    c2d.fill()

    // Actual end of line of sight
    c2d.beginPath()
    c2d.arc(actualLineOfSightEndPoint.x + camera.x, actualLineOfSightEndPoint.y + camera.y, 8, 0, 2 * Math.PI)
    c2d.closePath()
    c2d.fillStyle = '#39f'
    c2d.fill()
  }

  paint () {
    const c2d = this.canvas2d
    const camera = this.camera

    // Camera Controls: focus the camera on the target atom, if any.
    // ----------------
    if (camera.target) {
      camera.x = this.canvasWidth / 2 - camera.target.x
      camera.y = this.canvasHeight / 2 - camera.target.y
    }

    c2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

    c2d.strokeStyle = 'rgba(128, 128, 128, 0.05)'
    c2d.lineWidth = 2
    // ----------------

    // Draw grid
    // ----------------
    const offsetX = (this.camera.x % TILE_SIZE) - TILE_SIZE
    const offsetY = (this.camera.y % TILE_SIZE) - TILE_SIZE

    for (let y = offsetY ; y < this.canvasHeight ; y += TILE_SIZE) {
      for (let x = offsetX ; x < this.canvasWidth ; x += TILE_SIZE) {
        c2d.beginPath()
        c2d.rect(x, y, TILE_SIZE, TILE_SIZE)
        c2d.stroke()

        // Debug Grid
        if (DEBUG) {
          c2d.fillStyle = '#ccc'
          c2d.font = `1em Source Code Pro`
          c2d.textAlign = 'center'
          c2d.textBaseline = 'middle'
          const col = Math.floor((x - this.camera.x) / TILE_SIZE)
          const row = Math.floor((y - this.camera.y) / TILE_SIZE)
          c2d.fillText(col + ',' + row, x + TILE_SIZE / 2, y + TILE_SIZE / 2)  // using template strings here messes up colours in Brackets.
        }
      }
    }
    // ----------------

    // Draw atoms and other elements
    // ----------------
    const MAX_LAYER = 2
    for (let layer = 0 ; layer < MAX_LAYER ; layer++) {
      this.atoms.forEach(atom => atom.paint(layer))
      for (const id in this.rules) { this.rules[id].paint(layer) }
    }
    // ----------------

    // Draw player input
    // ----------------
    if (
      this.playerAction === PLAYER_ACTIONS.POINTER_DOWN
      && this.hero
      && this.playerInput.pointerCurrent
    ) {

      const inputCoords = this.playerInput.pointerCurrent

      c2d.strokeStyle = '#888'
      c2d.lineWidth = TILE_SIZE / 8

      c2d.beginPath()
      c2d.arc(inputCoords.x, inputCoords.y, TILE_SIZE, 0, 2 * Math.PI)
      c2d.stroke()
    }
    // ----------------

    // Draw UI data
    // ----------------
    const X_OFFSET = TILE_SIZE * 2.5
    const Y_OFFSET = TILE_SIZE * -1.0
    c2d.font = '3em Source Code Pro'
    c2d.textBaseline = 'bottom'
    c2d.lineWidth = 8

    const health = Math.max(this.hero?.health, 0) || 0
    let text = '❤️'.repeat(health)
    c2d.textAlign = 'left'
    c2d.strokeStyle = '#fff'
    c2d.strokeText(text, X_OFFSET, this.canvasHeight + Y_OFFSET)
    c2d.fillStyle = '#c44'
    c2d.fillText(text, X_OFFSET, this.canvasHeight + Y_OFFSET)

    text = this.hero?.action?.name + ' (' + this.hero?.moveSpeed.toFixed(2) + ')'
    c2d.textAlign = 'right'
    c2d.strokeStyle = '#fff'
    c2d.strokeText(text, this.canvasWidth - X_OFFSET, this.canvasHeight + Y_OFFSET)
    c2d.fillStyle = '#c44'
    c2d.fillText(text, this.canvasWidth - X_OFFSET, this.canvasHeight + Y_OFFSET)
    // ----------------

    this.paintLineOfSight()
  }

  /*
  Section: UI and Event Handling
  ----------------------------------------------------------------------------
   */

  setupUI () {
    this.html.canvas.width = this.canvasWidth
    this.html.canvas.height = this.canvasHeight

    if (window.PointerEvent) {
      this.html.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this))
      this.html.canvas.addEventListener('pointermove', this.onPointerMove.bind(this))
      this.html.canvas.addEventListener('pointerup', this.onPointerUp.bind(this))
      this.html.canvas.addEventListener('pointercancel', this.onPointerUp.bind(this))
    } else {
      this.html.canvas.addEventListener('mousedown', this.onPointerDown.bind(this))
      this.html.canvas.addEventListener('mousemove', this.onPointerMove.bind(this))
      this.html.canvas.addEventListener('mouseup', this.onPointerUp.bind(this))
    }

    // Prevent "touch and hold to open context menu" menu on touchscreens.
    this.html.canvas.addEventListener('touchstart', stopEvent)
    this.html.canvas.addEventListener('touchmove', stopEvent)
    this.html.canvas.addEventListener('touchend', stopEvent)
    this.html.canvas.addEventListener('touchcancel', stopEvent)

    this.html.buttonHome.addEventListener('click', this.buttonHome_onClick.bind(this))
    this.html.buttonFullscreen.addEventListener('click', this.buttonFullscreen_onClick.bind(this))
    this.html.buttonReload.addEventListener('click', this.buttonReload_onClick.bind(this))

    this.html.main.addEventListener('keydown', this.onKeyDown.bind(this))
    this.html.main.addEventListener('keyup', this.onKeyUp.bind(this))

    window.addEventListener('resize', this.updateUI.bind(this))
    this.updateUI()
    this.hideUI()  // Hide until all assets are ready

    this.html.main.focus()
  }

  hideUI () {
    this.html.buttonHome.style.visibility = 'hidden'
    this.html.buttonReload.style.visibility = 'hidden'
  }

  showUI () {
    this.html.buttonHome.style.visibility = 'visible'
    this.html.buttonReload.style.visibility = 'visible'
  }

  updateUI () {
    // Fit the interaction layers (menus, etc) to the canvas
    const mainDivBounds = this.html.main.getBoundingClientRect()
    const canvasBounds = this.html.canvas.getBoundingClientRect()

    this.html.homeMenu.style.width = `${canvasBounds.width}px`
    this.html.homeMenu.style.height = `${canvasBounds.height}px`
    this.html.homeMenu.style.top = `${canvasBounds.top - mainDivBounds.top}px`
    this.html.homeMenu.style.left = `${canvasBounds.left}px`

    this.html.interactionMenu.style.width = `${canvasBounds.width}px`
    this.html.interactionMenu.style.height = `${canvasBounds.height}px`
    this.html.interactionMenu.style.top = `${canvasBounds.top - mainDivBounds.top}px`
    this.html.interactionMenu.style.left = `${canvasBounds.left}px`
  }

  setHomeMenu (homeMenu) {
    this.homeMenu = homeMenu
    if (homeMenu) {
      this.html.homeMenu.style.visibility = 'visible'
      this.html.buttonReload.style.visibility = 'hidden'
    } else {
      this.html.homeMenu.style.visibility = 'hidden'
      this.html.buttonReload.style.visibility = 'visible'
      this.html.main.focus()
    }
  }

  setInteractionMenu (interactionMenu) {
    const div = this.html.interactionMenu

    this.interactionMenu && this.interactionMenu.unload()  // Unload the old menu, if any
    this.interactionMenu = interactionMenu  // Set the new menu

    if (interactionMenu) {
      while (div.firstChild) { div.removeChild(div.firstChild) }  // Clear div
      interactionMenu.load(div)  // load the new menu
      div.style.visibility = 'visible'
    } else {
      div.style.visibility = 'hidden'
      this.html.main.focus()
    }
  }

  onPointerDown (e) {
    const coords = getEventCoords(e, this.html.canvas)

    this.playerAction = PLAYER_ACTIONS.POINTER_DOWN
    this.playerInput.pointerStart = coords
    this.playerInput.pointerCurrent = coords
    this.playerInput.pointerEnd = undefined

    this.html.main.focus()

    return stopEvent(e)
  }

  onPointerMove (e) {
    const coords = getEventCoords(e, this.html.canvas)
    this.playerInput.pointerCurrent = coords

    return stopEvent(e)
  }

  onPointerUp (e) {
    const coords = getEventCoords(e, this.html.canvas)

    if (this.playerAction === PLAYER_ACTIONS.POINTER_DOWN) {
      this.playerInput.pointerEnd = coords
      this.playerAction = PLAYER_ACTIONS.IDLE
    }

    return stopEvent(e)
  }

  onKeyDown (e) {
    // Special cases
    switch (e.key) {
      // Open home menu
      case 'Escape':
        this.setHomeMenu(!this.homeMenu)
        break

      // DEBUG
      case 'z':
        if (!this.interactionMenu) {
          this.setInteractionMenu(new Interaction(this))
        }
        break
    }

    // General input
    if (!this.playerInput.keysPressed[e.key]) {
      this.playerInput.keysPressed[e.key] = {
        duration: 0,
        acknowledged: false,
      }
    }
  }

  onKeyUp (e) {
    this.playerInput.keysPressed[e.key] = undefined
  }

  buttonHome_onClick () {
    this.setHomeMenu(!this.homeMenu)
  }

  buttonFullscreen_onClick () {
    const isFullscreen = document.fullscreenElement
    if (!isFullscreen) {
      if (this.html.main.requestFullscreen) {
        this.html.main.className = 'fullscreen'
        this.html.main.requestFullscreen()
      }
    } else {
      document.exitFullscreen?.()
      this.html.main.className = ''
    }
    this.updateUI()
  }

  buttonReload_onClick () {
    this.levels.reload()
  }

  /*
  Section: Gameplay
  ----------------------------------------------------------------------------
   */

  addRule (rule) {
    if (!rule) return
    const id = rule._type
    this.rules[id] = rule
  }

  clearRules () {
    for (const id in this.rules) { delete this.rules[id] }
  }

  /*
  Section: Misc
  ----------------------------------------------------------------------------
   */

  checkCollisions (timeStep) {
    for (let a = 0 ; a < this.atoms.length ; a++) {
      let atomA = this.atoms[a]

      for (let b = a + 1 ; b < this.atoms.length ; b++) {
        let atomB = this.atoms[b]
        let collisionCorrection = Physics.checkCollision(atomA, atomB)

        if (collisionCorrection) {
          atomA.onCollision(atomB, collisionCorrection.a)
          atomB.onCollision(atomA, collisionCorrection.b)
        }
      }
    }
  }
}

function getEventCoords (event, element) {
  const xRatio = (element.width && element.offsetWidth) ? element.width / element.offsetWidth : 1
  const yRatio = (element.height && element.offsetHeight) ? element.height / element.offsetHeight : 1

  const x = event.offsetX * xRatio
  const y = event.offsetY * yRatio
  return { x, y }
}

function stopEvent (e) {
  if (!e) return false
  e.preventDefault && e.preventDefault()
  e.stopPropagation && e.stopPropagation()
  e.returnValue = false
  e.cancelBubble = true
  return false
}
