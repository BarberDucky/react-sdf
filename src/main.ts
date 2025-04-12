import { Camera } from "./camera"
import { initializeCanvas, resizeCanvasToDisplaySize } from "./canvas/canvas-utils"
import KeyboardMovementManager from "./keyboard-movement-manager"
import { ShapeController } from "./model/shape-controller"
import MouseMovementManager from "./mouse-movement-manager"
import { SdfRenderer } from './renderers/sdf-renderer'
import './style.css'
import { AbstractUiBindings } from "./ui/bindings"
import { Ui } from "./ui/ui"
import { Point3 } from "./utils"
import { Uniform2f, Uniform3f, WebGlContext } from "./webgl/webgl-context"

const shapeController = new ShapeController()
const sdfRenderer = new SdfRenderer()
const keyboardMovementManager = new KeyboardMovementManager()
const mouseMovementManager = new MouseMovementManager()
const canvas = initializeCanvas('#mainCanvas')

const webGlContext = new WebGlContext(canvas, sdfRenderer.generateVertexShaderString(), sdfRenderer.generateFragmentShaderString(shapeController.rootOperation))

class UiBindings extends AbstractUiBindings {
  override createSphere(position: Point3, radius: number, color: Point3) {
    shapeController.addSphere(position, radius, color)
  }

  override createBox(position: Point3, dimensions: Point3, color: Point3) {
    shapeController.addBox(position, dimensions, color)
  }
}

const ui = new Ui(document.querySelector<HTMLCanvasElement>('#app')!, new UiBindings())

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
  webGlContext.recompileFragmentShader(sdfRenderer.generateFragmentShaderString(shapeController.rootOperation))

  resizeCanvasToDisplaySize(canvas)
  webGlContext.resizeViewport(canvas.width, canvas.height)

  uResolution.updateValue({ x: canvas.width, y: canvas.height })
  uCameraOrigin.updateValue({ x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z })
  uLookAt.updateValue({ x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z })

  webGlContext.requestDraw()
  window.requestAnimationFrame(animate)
}

animate()