import { Camera } from "./camera"
import { initializeCanvas, resizeCanvasToDisplaySize } from "./canvas/canvas-utils"
import KeyboardMovementManager from "./keyboard-movement-manager"
import { exampleScene1 } from "./model/scenes"
import { ShapeController } from "./model/shape-controller"
import MouseMovementManager from "./mouse-movement-manager"
import { SdfRenderer } from './renderers/sdf-renderer'
import './style.css'
import { Uniform2f, Uniform3f, WebGlContext } from "./webgl/webgl-context"

const shapeController = new ShapeController(exampleScene1)
const sdfRenderer = new SdfRenderer()
const keyboardMovementManager = new KeyboardMovementManager()
const mouseMovementManager = new MouseMovementManager()
const canvas = initializeCanvas('#mainCanvas')
const webGlContext = new WebGlContext(canvas, sdfRenderer.generateVertexShaderString(), sdfRenderer.generateFragmentShaderString(shapeController.shapes))

const camera = new Camera(
  { x: 3, y: 3, z: -3 },
  { x: 0, y: 0, z: 0 }
)

mouseMovementManager.addMoveCallback(deltaMove => {
  if (!keyboardMovementManager.getIsShiftPressed()) {
    camera.orbit(-deltaMove.x, -deltaMove.y)
  }

  if (keyboardMovementManager.getIsShiftPressed()) {
    camera.pan(-deltaMove.x, -deltaMove.y)
  }
})

mouseMovementManager.addWheelCallback(deltaWheel => {
  camera.zoom(deltaWheel)
})

const uResolution = webGlContext.registerUniform('iResolution', { type: '2f', value: { x: canvas.width, y: canvas.height } }) as Uniform2f
const uCameraOrigin = webGlContext.registerUniform('iCameraOrigin', { type: '3f', value: { x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z } }) as Uniform3f
const uLookAt = webGlContext.registerUniform('iLookAt', { type: '3f', value: { x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z } }) as Uniform3f

const animate = () => {
  resizeCanvasToDisplaySize(canvas)
  webGlContext.resizeViewport(canvas.width, canvas.height)

  uResolution.updateValue({ x: canvas.width, y: canvas.height })
  uCameraOrigin.updateValue({ x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z })
  uLookAt.updateValue({ x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z })

  webGlContext.requestDraw()
  window.requestAnimationFrame(animate)
}

animate()