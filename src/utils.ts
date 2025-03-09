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