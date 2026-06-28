import { Camera } from "./camera"
import { initializeCanvas, resizeCanvasToDisplaySize } from "./canvas/canvas-utils"
import KeyboardMovementManager from "./keyboard-movement-manager"
import { FlatShapeListEntry, ShapeController } from "./model/shape-controller"
import MouseMovementManager from "./mouse-movement-manager"
import { SdfRenderer } from './renderers/sdf-renderer'
import './style.css'
import Ui from "./ui/ui"
import { Uniform2f, Uniform3f, WebGlContext } from "./webgl/webgl-context"

import { createRoot } from "react-dom/client"
import { Store } from "./store"

const shapeController = new ShapeController()
const sdfRenderer = new SdfRenderer()
const keyboardMovementManager = new KeyboardMovementManager()
const canvas = initializeCanvas('#mainCanvas')
const mouseMovementManager = new MouseMovementManager(canvas)

interface AppStoreModel {
  isGizmoEnabled: boolean
  selectedShape: 'sphere' | 'box' | null
  shapesRoot: Array<FlatShapeListEntry>
  selectedExistingShape: string | null
}

export const store = new Store<AppStoreModel>({
  isGizmoEnabled: true,
  selectedShape: null,
  shapesRoot: shapeController.flatShapeList,
  selectedExistingShape: null,
})

const webGlContext = new WebGlContext(
  canvas,
  sdfRenderer.generateVertexShaderString(),
  sdfRenderer.generateFragmentShaderString(shapeController.rootOperation, store.getState().isGizmoEnabled)
)

const camera = new Camera(
  { x: 3, y: 3, z: -3 },
  { x: 0, y: 0, z: 0 }
)

mouseMovementManager.addClickCallback(() => {
  const activeShape = store.getState().selectedShape

  if (activeShape === 'sphere') {
    shapeController.addSphere(
      { x: 0, y: 0, z: 0 },
      0.5,
      { x: Math.random(), y: Math.random(), z: Math.random() },
    )
  }
  if (activeShape === 'box') {
    shapeController.addBox(
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 },
      { x: Math.random(), y: Math.random(), z: Math.random() },
    )
  }

  store.setState({
    ...store.getState(),
    selectedShape: null,
    shapesRoot: shapeController.flatShapeList,
  })
})

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
  webGlContext.recompileFragmentShader(sdfRenderer.generateFragmentShaderString(shapeController.rootOperation, store.getState().isGizmoEnabled))

  resizeCanvasToDisplaySize(canvas)
  webGlContext.resizeViewport(canvas.width, canvas.height)

  uResolution.updateValue({ x: canvas.width, y: canvas.height })
  uCameraOrigin.updateValue({ x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z })
  uLookAt.updateValue({ x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z })

  webGlContext.requestDraw()
  window.requestAnimationFrame(animate)
}

animate()

const reactRoot = createRoot(document.getElementById('reactRoot')!)

reactRoot.render(
    <Ui />
)