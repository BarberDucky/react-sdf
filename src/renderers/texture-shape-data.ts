import { SmoothUnionOperation, UnionOperation } from "../model/operations";
import { Box, Sphere } from "../model/shapes";

enum TextureShapeType {
  Sphere = 0,
  Box = 1,
  Union = 2,
  SmoothUnion = 3
}

const SHAPE_TO_TEXTURE_DATA_TYPE: Record<string, TextureShapeType> = {
  'Sphere': TextureShapeType.Sphere,
  'Box': TextureShapeType.Box,
  'Union': TextureShapeType.Union,
  'SmoothUnion': TextureShapeType.SmoothUnion,
}

export function extractSphere(s: Sphere): Float32Array {
  const data = new Float32Array(12)

  data.set([SHAPE_TO_TEXTURE_DATA_TYPE[s.type], s.radius])
  data.set([s.position.x, s.position.y, s.position.z], 4)
  data.set([s.color.x, s.color.y, s.color.z], 8)

  return data
}

export function extractBox(b: Box): Float32Array {
  const data = new Float32Array(12)

  data.set([SHAPE_TO_TEXTURE_DATA_TYPE[b.type], b.dimensions.x, b.dimensions.y, b.dimensions.z])
  data.set([b.position.x, b.position.y, b.position.z], 4)
  data.set([b.color.x, b.color.y, b.color.z], 8)

  return data
}

export function extractUnion(u: UnionOperation): Float32Array {
  const data = new Float32Array(12)

  data.set([SHAPE_TO_TEXTURE_DATA_TYPE[u.type]])

  return data
}

export function extractSmoothUnion(u: SmoothUnionOperation): Float32Array {
  const data = new Float32Array(12)

  data.set([SHAPE_TO_TEXTURE_DATA_TYPE[u.type], u.smoothness])

  return data
}