import { Camera } from "./camera"
import { initializeCanvas, resizeCanvasToDisplaySize } from "./canvas/canvas-utils"
import KeyboardMovementManager from "./keyboard-movement-manager"
import { ShapeController } from "./model/shape-controller"
import MouseMovementManager from "./mouse-movement-manager"
// import { SDFReactCanvas } from "./react/react-renderer"
import { SdfRenderer } from './renderers/sdf-renderer'
import './style.css'
import { AbstractUiBindings } from "./ui/bindings"
import Ui from "./ui/ui"
import { Point3 } from "./utils"
import { Uniform2f, Uniform3f, WebGlContext } from "./webgl/webgl-context"

import { SDFElementsObject } from "./react/reconciler"
import { createRoot } from "react-dom/client"
import { createContext } from "react"
import { Store } from "./store"

const shapeController = new ShapeController()
const sdfRenderer = new SdfRenderer()
const keyboardMovementManager = new KeyboardMovementManager()
const canvas = initializeCanvas('#mainCanvas')
const mouseMovementManager = new MouseMovementManager(canvas)

interface AppStoreModel {
  isGizmoEnabled: boolean
  selectedShape: 'sphere' | 'box' | null
}

export const store = new Store<AppStoreModel>({
  isGizmoEnabled: true,
  selectedShape: null,
})

const webGlContext = new WebGlContext(
  canvas,
  sdfRenderer.generateVertexShaderString(),
  sdfRenderer.generateFragmentShaderString(shapeController.rootOperation, store.getState().isGizmoEnabled)
)

class UiBindings extends AbstractUiBindings {
  override createSphere(position: Point3, radius: number, color: Point3) {
    shapeController.addSphere(position, radius, color)
  }

  override createBox(position: Point3, dimensions: Point3, color: Point3) {
    shapeController.addBox(position, dimensions, color)
  }

  override setActiveShape(shape: "sphere" | "box" | null): void {
    store.setState({
      ...store.getState(),
      selectedShape: shape,
    })
  }

  override toggleGizmo(): void {
    store.setState({
      ...store.getState(),
      isGizmoEnabled: !store.getState().isGizmoEnabled,
    })
  }
}

const camera = new Camera(
  { x: 3, y: 3, z: -3 },
  { x: 0, y: 0, z: 0 }
)

mouseMovementManager.addClickCallback(position => {
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
  // webGlContext.recompileFragmentShader(sdfRenderer.generateFragmentShaderString(shapeController.rootOperation, store.getState().isGizmoEnabled))

  resizeCanvasToDisplaySize(canvas)
  webGlContext.resizeViewport(canvas.width, canvas.height)

  uResolution.updateValue({ x: canvas.width, y: canvas.height })
  uCameraOrigin.updateValue({ x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z })
  uLookAt.updateValue({ x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z })

  webGlContext.requestDraw()
  window.requestAnimationFrame(animate)
}

animate()

// const sdfReactCanvas = new SDFReactCanvas(shapeController)

declare module 'react'
{
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements extends SDFElementsObject { }
  }
}

// sdfReactCanvas.render(
//   <smoothUnion smoothness={0.5}>
//     <sphere
//       position={{ x: 0, y: 0, z: 1 }}
//       color={{ x: 1, y: 0, z: 0 }}
//       radius={1}
//     />
//     <box
//       position={{ x: 0, y: 0, z: 0 }}
//       color={{ x: 0, y: 1, z: 0 }}
//       dimensions={{ x: 1, y: 1, z: 1 }}
//     /> 
//     <sphere
//       position={{ x: 0, y: 0, z: -1 }}
//       color={{ x: 0, y: 0, z: 1 }}
//       radius={1}
//     />
//   </smoothUnion>
// )

const reactRoot = createRoot(document.getElementById('reactRoot')!)
export const UiContext = createContext<UiBindings>(new UiBindings())

reactRoot.render(
  <UiContext.Provider value={new UiBindings()}>
    <Ui />
  </UiContext.Provider>
)