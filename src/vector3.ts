import { Mat3, Point3 } from './utils'

export function vector3Add(a: Point3, b: Point3): Point3 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  }
}

export function vector3Subtract(a: Point3, b: Point3): Point3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  }
}

export function vector3Scale(a: Point3, scaleFactor: number) {
  return {
    x: a.x * scaleFactor,
    y: a.y * scaleFactor,
    z: a.z * scaleFactor,
  }
}

export function vector3Length(a: Point3): number {
  return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z)
}

export function vector3Normalize(a: Point3): Point3 {
  const len = vector3Length(a)
  if (len === 0) {
    return { x: 0, y: 0, z: 0 }
  }
  return {
    x: a.x / len,
    y: a.y / len,
    z: a.z / len,
  }
}

export function vector3Dot(a: Point3, b: Point3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

export function vector3Cross(a: Point3, b: Point3): Point3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}

export function vector3Max(a: Point3, b: number) {
  return {
    x: Math.max(a.x, b),
    y: Math.max(a.y, b),
    z: Math.max(a.z, b),
  }
}

export function rotateXYZ(a: Point3): Mat3 {
  const sx = Math.sin(a.x), cx = Math.cos(a.x)
  const sy = Math.sin(a.y), cy = Math.cos(a.y)
  const sz = Math.sin(a.z), cz = Math.cos(a.z)

  const rx = new Mat3([1.0, 0.0, 0.0, 0.0, cx, -sx, 0.0, sx, cx])
  const ry = new Mat3([cy, 0.0, sy, 0.0, 1.0, 0.0, -sy, 0.0, cy])
  const rz = new Mat3([cz, -sz, 0.0, sz, cz, 0.0, 0.0, 0.0, 1.0])

  return rz.multiplyMatrix(ry.multiplyMatrix(rx))
}