import { clamp, Mat3, mix, Point3 } from '../utils.ts'
import { vector3Cross, vector3Length, vector3Max, vector3Normalize, vector3Subtract } from '../vector3.ts'
import { Operation } from '../model/shape-tree.ts'

export function sdSphere(p: Point3, s: number) {
  return vector3Length(p) - s
}

export function sdBox(p: Point3, b: Point3) {
  const q = {
    x: Math.abs(p.x) - b.x,
    y: Math.abs(p.y) - b.y,
    z: Math.abs(p.z) - b.z,
  }
  return vector3Length(vector3Max(q, 0.0)) + Math.min(Math.max(q.x, Math.max(q.y, q.z)), 0.0)
}

export function opRound(d: number, rad: number) {
  return d - rad
}

export function doOperation(opData: Operation, d1: number, d2: number) {
  if (opData.type == 'union') {
    return opSmoothUnion(d1, d2, opData.smoothness ?? 0)
  } else if (opData.type == 'difference') {
    return opSmoothSubtraction(d1, d2, opData.smoothness ?? 0)
  } else if (opData.type == 'intersection') {
    return opSmoothIntersection(d1, d2, opData.smoothness ?? 0)
  }
  return d1
}

export function opSmoothUnion(d1: number, d2: number, k: number) {
  const h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0)
  return mix(d2, d1, h) - k * h * (1.0 - h)
}

export function opSmoothSubtraction(a: number, b: number, k: number) {
  return -opSmoothUnion(a, -b, k)
}

export function opSmoothIntersection(a: number, b: number, k: number) {
  return -opSmoothUnion(-a, -b, k)
}

export function setCamera(target: Point3, position: Point3) {
  const z = vector3Normalize(vector3Subtract(target, position))
  const x = vector3Normalize(vector3Cross(z, { x: 0.0, y: 1.0, z: 0.0 }))
  const y = vector3Normalize(vector3Cross(x, z))
  return new Mat3([
    x.x, y.x, z.x,
    x.y, y.y, z.y,
    x.z, y.z, z.z,
  ])
}