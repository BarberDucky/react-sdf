import { Camera } from './camera'
import { initializeCanvas, resizeCanvasToDisplaySize } from './canvas/canvas-utils'
import KeyboardMovementManager from './keyboard-movement-manager'
import { FlatShapeListEntry, ShapeController } from './model/shape-controller'
import MouseMovementManager from './mouse-movement-manager'
import './style.css'
import Ui from './ui/ui'
import { WebGlContext } from './webgl/webgl-context.ts'

import { createRoot } from 'react-dom/client'
import { Store } from './store'
import { generateListShaderTextures } from './renderers/generate-data-textures.ts'
import { TEXEL_COUNT } from './renderers/consts.ts'
import { getShapeAtPoint } from './renderers/cpu-raymarcher.ts'
import { Box, Sphere } from './model/shapes.ts'

const shapeController = new ShapeController()
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

const webGlContext = new WebGlContext(canvas)

const camera = new Camera(
  { x: 3, y: 3, z: -3 },
  { x: 0, y: 0, z: 0 },
)

mouseMovementManager.addClickCallback(p => {
  const activeShape = store.getState().selectedShape

  if (activeShape == null) {

    const shapeId = getShapeAtPoint(
      p,
      { x: canvas.width, y: canvas.height },
      { x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z },
      { x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z },
      shapeController.flatShapeList,
    )

    const oldShapeId = store.getState().selectedExistingShape

    store.setState({
      ...store.getState(),
      selectedExistingShape: shapeId == oldShapeId
        ? null
        : shapeId,
    })

    if (oldShapeId != null) {
      const oldSelectedShape = shapeController.getShapeById(oldShapeId)
      if (oldSelectedShape instanceof Sphere || oldSelectedShape instanceof Box) {
        oldSelectedShape.isSelected = false
      }
    }

    if (shapeId == null) {
      return
    }

    const selectedShape = shapeController.getShapeById(shapeId)
    if (selectedShape instanceof Sphere || selectedShape instanceof Box) {
      selectedShape.isSelected = shapeId == store.getState().selectedExistingShape
    }
  }

  if (activeShape === 'sphere') {
    shapeController.addSphere(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      1,
      0.5,
      { x: Math.random(), y: Math.random(), z: Math.random() },
      { type: 'union' },
      0,
      false,
    )
  }
  if (activeShape === 'box') {
    shapeController.addBox(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      1,
      { x: 1, y: 1, z: 1 },
      { x: Math.random(), y: Math.random(), z: Math.random() },
      { type: 'union' },
      0,
      false,
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

const uResolution = webGlContext.registerUniform('iResolution', { type: '2f', value: { x: canvas.width, y: canvas.height } }, webGlContext._sceneProgram)
const uCameraOrigin = webGlContext.registerUniform('iCameraOrigin', { type: '3f', value: { x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z } }, webGlContext._sceneProgram)
const uLookAt = webGlContext.registerUniform('iLookAt', { type: '3f', value: { x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z } }, webGlContext._sceneProgram)
const uIsGizmoEnabled = webGlContext.registerUniform('iIsGizmoEnabled', { type: 'bool', value: store.getState().isGizmoEnabled }, webGlContext._sceneProgram)
const uTexelCount = webGlContext.registerUniform('iTexelCount', { type: '1i', value: TEXEL_COUNT }, webGlContext._sceneProgram)
const uShapeCount = webGlContext.registerUniform('iShapeCount', { type: '1i', value: shapeController.flatShapeList.length }, webGlContext._sceneProgram)

const uMaskResolution = webGlContext.registerUniform('iResolution', { type: '2f', value: { x: canvas.width, y: canvas.height } }, webGlContext._maskProgram)
const uMaskCameraOrigin = webGlContext.registerUniform('iCameraOrigin', { type: '3f', value: { x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z } }, webGlContext._maskProgram)
const uMaskLookAt = webGlContext.registerUniform('iLookAt', { type: '3f', value: { x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z } }, webGlContext._maskProgram)
const uMaskIsGizmoEnabled = webGlContext.registerUniform('iIsGizmoEnabled', { type: 'bool', value: store.getState().isGizmoEnabled }, webGlContext._maskProgram)
const uMaskTexelCount = webGlContext.registerUniform('iTexelCount', { type: '1i', value: TEXEL_COUNT }, webGlContext._maskProgram)
const uMaskShapeCount = webGlContext.registerUniform('iShapeCount', { type: '1i', value: shapeController.flatShapeList.length }, webGlContext._maskProgram)

const uHighlightResolution = webGlContext.registerUniform('iResolution', { type: '2f', value: { x: canvas.width, y: canvas.height } }, webGlContext._highlightProgram)

const listTex = webGlContext.createDataTexture('iShapeDataTexture')

const animate = () => {

  resizeCanvasToDisplaySize(canvas)
  webGlContext.resizeViewport(canvas.width, canvas.height)

  uResolution.value = ({ x: canvas.width, y: canvas.height })
  uCameraOrigin.value = ({ x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z })
  uLookAt.value = ({ x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z })
  uIsGizmoEnabled.value = (store.getState().isGizmoEnabled)
  uShapeCount.value = (shapeController.flatShapeList.length)

  uMaskResolution.value = ({ x: canvas.width, y: canvas.height })
  uMaskCameraOrigin.value = ({ x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z })
  uMaskLookAt.value = ({ x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z })
  uMaskIsGizmoEnabled.value = (store.getState().isGizmoEnabled)
  uMaskShapeCount.value = (shapeController.flatShapeList.length)

  uHighlightResolution.value = ({ x: canvas.width, y: canvas.height })

  const listData = generateListShaderTextures(shapeController.rootOperation, shapeController.flatShapeList.length)
  webGlContext.setDataTexture(listTex, listData, TEXEL_COUNT * shapeController.flatShapeList.length, 1)

  webGlContext.requestDraw()
  window.requestAnimationFrame(animate)
}

animate()

const reactRoot = createRoot(document.getElementById('reactRoot')!)

reactRoot.render(
  <Ui/>,
)