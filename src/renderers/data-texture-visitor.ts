import { Group, Operation } from '../model/shape-tree'
import { Box, Sphere } from '../model/shapes'
import { Visitor } from '../model/visitor'
import { DATA_TEXT_ROW_SIZE, TEXEL_COUNT } from './consts.ts'

enum TextureShapeType {
  Group = 0,
  Sphere = 1,
  Box = 2,
}

enum TextureOperationType {
  Union = 0,
  Difference = 1,
  Intersection = 2,
}

const OPERATION_MAPPER: Record<Operation['type'], TextureOperationType> = {
  union: TextureOperationType.Union,
  difference: TextureOperationType.Difference,
  intersection: TextureOperationType.Intersection,
}

export class DataTextureVisitor extends Visitor<Float32Array, undefined> {

  visitGroup(g: Group) {
    const data = new Float32Array(DATA_TEXT_ROW_SIZE * TEXEL_COUNT)

    data.set([TextureShapeType.Group, OPERATION_MAPPER[g.operation.type], g.operation?.smoothness ?? -1])

    return data
  }

  visitSphere(s: Sphere): Float32Array {
    const data = new Float32Array(DATA_TEXT_ROW_SIZE * TEXEL_COUNT)

    data.set([TextureShapeType.Sphere, s.radius])
    data.set([s.position.x, s.position.y, s.position.z], DATA_TEXT_ROW_SIZE)
    data.set([s.color.x, s.color.y, s.color.z, s.isSelected ? 1 : 0], DATA_TEXT_ROW_SIZE * 2)
    data.set([s.rotation.x, s.rotation.y, s.rotation.z, s.scale], DATA_TEXT_ROW_SIZE * 3)
    data.set([OPERATION_MAPPER[s.operation.type], s.operation?.smoothness ?? 0, s.roundness], DATA_TEXT_ROW_SIZE * 4)

    return data
  }

  visitBox(b: Box): Float32Array {
    const data = new Float32Array(DATA_TEXT_ROW_SIZE * TEXEL_COUNT)

    data.set([TextureShapeType.Box, b.dimensions.x, b.dimensions.y, b.dimensions.z])
    data.set([b.position.x, b.position.y, b.position.z], DATA_TEXT_ROW_SIZE)
    data.set([b.color.x, b.color.y, b.color.z, b.isSelected ? 1 : 0], DATA_TEXT_ROW_SIZE * 2)
    data.set([b.rotation.x, b.rotation.y, b.rotation.z, b.scale], DATA_TEXT_ROW_SIZE * 3)
    data.set([OPERATION_MAPPER[b.operation.type], b.operation?.smoothness ?? 0, b.roundness], DATA_TEXT_ROW_SIZE * 4)

    return data
  }

}