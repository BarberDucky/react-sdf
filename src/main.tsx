import { Camera } from './camera'
import { initializeCanvas, resizeCanvasToDisplaySize } from './canvas/canvas-utils'
import KeyboardMovementManager from './keyboard-movement-manager'
import { FlatShapeListEntry, ShapeController } from './model/shape-controller'
import MouseMovementManager, { MouseDragEvent } from './mouse-movement-manager'
import './style.css'
import Ui from './ui/ui'
import { WebGlContext } from './webgl/webgl-context.ts'

import { createRoot } from 'react-dom/client'
import { Store } from './store'
import { generateListShaderTextures } from './renderers/generate-data-textures.ts'
import { TEXEL_COUNT } from './renderers/consts.ts'
import { getNewPosition, getShapeAtPoint } from './renderers/cpu-raymarcher.ts'
import { Box, Sphere } from './model/shapes.ts'
import { Mat4, Point3 } from './utils.ts'
import { vector3Add, vector3Cross, vector3Dot, vector3Normalize, vector3Subtract } from './vector3.ts'

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

let movingShape: string | null = null
let dragOffset: Point3 = { x: 0, y: 0, z: 0 }

mouseMovementManager.addMoveCallback((origin, current, deltaMove, eventType) => {

  if (eventType == MouseDragEvent.Start) {
    movingShape = getShapeAtPoint(
      origin,
      { x: canvas.width, y: canvas.height },
      { x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z },
      { x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z },
      shapeController.flatShapeList,
    )

    if (movingShape != null) {
      const selectedShape = shapeController.getShapeById(movingShape)
      if (selectedShape != null && selectedShape instanceof Sphere || selectedShape instanceof Box) {
        const shapePos = selectedShape.position

        const hitPosition = getNewPosition(
          current,
          selectedShape.position,
          { x: canvas.width, y: canvas.height },
          { x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z },
          { x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z },
        )

        dragOffset = vector3Subtract(shapePos, hitPosition)
      }
    }
  }

  if (eventType == MouseDragEvent.End) {
    movingShape = null
    dragOffset = { x: 0, y: 0, z: 0 }
  }

  if (movingShape != null && movingShape == store.getState().selectedExistingShape) {
    const selectedShape = shapeController.getShapeById(movingShape)
    if (selectedShape instanceof Sphere || selectedShape instanceof Box) {
      const newPos = getNewPosition(
        current,
        selectedShape.position,
        { x: canvas.width, y: canvas.height },
        { x: camera.getOrigin().x, y: camera.getOrigin().y, z: camera.getOrigin().z },
        { x: camera.getTarget().x, y: camera.getTarget().y, z: camera.getTarget().z },
      )

      selectedShape.position = vector3Add(newPos, dragOffset)
    }
    return
  }

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

const aGizmoTransform = webGlContext.registerUniform('iGizmoTransform', { type: 'mat4fv', value: Mat4.identity() }, webGlContext._gizmoProgram)

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

  const near = 0
  const far = 100
  const aspect = canvas.width / canvas.height
  const fovy = 1

  const f = 1 / Math.tan(fovy / 2)
  const nf = 1 / (near - far)

  const projection = new Mat4([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ])

  const up = { x: 0, y: 1, z: 0 }
  const forward = vector3Normalize(vector3Subtract(camera.getTarget(), camera.getOrigin()))
  const right = vector3Normalize(vector3Cross(forward, up))
  const camUp = vector3Cross(right, forward)

  const view = new Mat4([
    right.x,   camUp.x,   -forward.x,  0,
    right.y,   camUp.y,   -forward.y,  0,
    right.z,   camUp.z,   -forward.z,  0,
    -vector3Dot(right, camera.getOrigin()), -vector3Dot(camUp, camera.getOrigin()), vector3Dot(forward, camera.getOrigin()), 1
  ])

  aGizmoTransform.value = view.multiplyMatrix(projection)

  webGlContext.requestDraw()
  window.requestAnimationFrame(animate)
}

animate()

const reactRoot = createRoot(document.getElementById('reactRoot')!)

reactRoot.render(
  <Ui/>,
)