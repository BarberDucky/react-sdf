export type Point2 = { x: number, y: number }
export type Point3 = { x: number, y: number, z: number }

export function floatToGlslFloat(value: number): string {
  if (Number.isInteger(value)) {
    return value + '.0'
  } else {
    return value.toString()
  }
}

export function point3ToVec3(value: Point3) {
  return `vec3(${floatToGlslFloat(value.x)}, ${floatToGlslFloat(value.y)}, ${floatToGlslFloat(value.z)})`
}