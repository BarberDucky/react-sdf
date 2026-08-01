export type Point2 = { x: number, y: number }
export type Point3 = { x: number, y: number, z: number }

export class Mat3 {

  constructor(public m: number[]) {
    if (m.length !== 9) {
      throw new Error("Mat3 requires exactly 9 elements")
    }
  }

  static identity(): Mat3 {
    return new Mat3([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ])
  }

  // Multiply this matrix by another matrix: this * other
  multiplyMatrix(other: Mat3): Mat3 {
    const a = this.m
    const b = other.m
    const result = new Array(9).fill(0)

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        let sum = 0
        for (let k = 0; k < 3; k++) {
          sum += a[row * 3 + k] * b[k * 3 + col]
        }
        result[row * 3 + col] = sum
      }
    }

    return new Mat3(result)
  }

  multiplyPoint(p: Point3): Point3 {
    const m = this.m
    const x = m[0] * p.x + m[1] * p.y + m[2] * p.z
    const y = m[3] * p.x + m[4] * p.y + m[5] * p.z
    const z = m[6] * p.x + m[7] * p.y + m[8] * p.z
    return { x, y, z }
  }
}

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

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function hexToRgb(hex: string) {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return { r, g, b }
}

export function dedent(strings: TemplateStringsArray, ...values: unknown[]): string {
  let fullString = strings.reduce((acc, str, i) => {
    const value = values[i] !== undefined ? String(values[i]) : ''
    return acc + str + value
  }, '')

  const lines = fullString.split('\n')
  while (lines.length && lines[0].trim() === '') lines.shift()
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop()

  const minIndent = lines.reduce((acc, line) => {
    if (!line.trim()) return acc
    const match = line.match(/^(\s+)/)
    if (!match) return 0
    return Math.min(acc, match[1].length)
  }, Infinity)

  if (minIndent !== Infinity) {
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].slice(minIndent)
    }
  }

  return lines.join('\n')
}