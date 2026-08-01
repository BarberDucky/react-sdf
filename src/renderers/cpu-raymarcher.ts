import { Point2, Point3 } from "../utils.ts"
import { FlatShapeListEntry } from "../model/shape-controller.ts"
import { Group } from "../model/shape-tree.ts"
import { Box, Sphere } from "../model/shapes.ts"
import { rotateXYZ, vector3Normalize } from "../vector3.ts"
import { doOperation, opRound, sdBox, sdSphere, setCamera } from "./cpu-sdf-utils.ts"

export function normalizeMouseCoordinates(x: number, y: number, canvas: HTMLCanvasElement) {
  const cd = canvas.getBoundingClientRect()

  if (x < cd.x || x > cd.width + cd.x || y < cd.y || y > cd.height + cd.y) {
    return {
      x: -1,
      y: -1,
    }
  }

  const nx = Math.max(x - cd.x, 0)
  const ny = Math.max(y - cd.y, 0)

  const nw = nx / cd.width
  const nh = ny / cd.height

  return {
    x: nw,
    y: nh,
  }
}

function mapShapes(p: Point3, shapes: FlatShapeListEntry[]) {
  let shapeDist = 1000
  let shapeId: string | null = null

  for (let i = 0; i < shapes.length; i++) {
    const curr = shapes[i].node

    if (curr instanceof Group) {
      // skip group
    } else if (curr instanceof Sphere) {
      const rotMat = rotateXYZ({
        x: -curr.rotation.x,
        y: -curr.rotation.y,
        z: -curr.rotation.z,
      })

      const rotP = rotMat.multiplyPoint({
        x: p.x - curr.position.x,
        y: p.y - curr.position.y,
        z: p.z - curr.position.z,
      })

      const rotPScaled = {
        x: rotP.x / curr.scale,
        y: rotP.y / curr.scale,
        z: rotP.z / curr.scale,
      }

      let m = sdSphere(rotPScaled, curr.radius - curr.radius * curr.roundness / 100) * curr.scale
      m = opRound(m, curr.radius * curr.roundness / 100 * curr.scale)
      shapeId = m < shapeDist ? curr.id : shapeId

      shapeDist = doOperation(curr.operation, shapeDist, m)
    } else if (curr instanceof Box) {

      const minDim = Math.min(Math.min(curr.dimensions.x, curr.dimensions.y), curr.dimensions.z)

      const rotMat = rotateXYZ({
        x: -curr.rotation.x,
        y: -curr.rotation.y,
        z: -curr.rotation.z,
      })

      const rotP = rotMat.multiplyPoint({
        x: p.x - curr.position.x,
        y: p.y - curr.position.y,
        z: p.z - curr.position.z,
      })

      const rotPScaled = {
        x: rotP.x / curr.scale,
        y: rotP.y / curr.scale,
        z: rotP.z / curr.scale,
      }

      const dimensions = {
        x: curr.dimensions.x - minDim * curr.roundness / 100,
        y: curr.dimensions.y - minDim * curr.roundness / 100,
        z: curr.dimensions.z - minDim * curr.roundness / 100,
      }

      let m = sdBox(rotPScaled, dimensions) * curr.scale
      m = opRound(m, minDim * curr.roundness / 100. * curr.scale)
      shapeId = m < shapeDist ? curr.id : shapeId

      shapeDist = doOperation(curr.operation, shapeDist, m)
    }

  }

  return { shapeId, shapeDist }
}

export function getShapeAtPoint(point: Point2, resolution: Point2, cameraOrigin: Point3, lookAt: Point3, shapes: FlatShapeListEntry[]) {
  const uv = {
    x: (point.x * 2 - resolution.x) / resolution.y,
    y: -1 * (point.y * 2 - resolution.y) / resolution.y,
  }

  const camera = setCamera(lookAt, cameraOrigin)
  const rd = vector3Normalize(camera.multiplyPoint({
    x: uv.x * 0.5,
    y: uv.y * 0.5,
    z: 1,
  }))

  let t = 0
  let p = { x: 0, y: 0, z: 0 }

  for (let i = 0; i < 256; i++) {
    p = {
      x: cameraOrigin.x + rd.x * t,
      y: cameraOrigin.y + rd.y * t,
      z: cameraOrigin.z + rd.z * t,
    }

    const d = mapShapes(p, shapes)

    t += d.shapeDist

    if (d.shapeDist < .001) break;

    if (t > 1000.) {
      return null
    }
  }

  return mapShapes(p, shapes).shapeId
}