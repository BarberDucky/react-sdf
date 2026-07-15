import { Group, Operation } from "../model/shape-tree";
import { Box, Sphere } from "../model/shapes";
import { Visitor } from "../model/visitor";

enum TextureShapeType {
  Sphere = 0,
  Box = 1,
  Group = 2,
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
    const data = new Float32Array(16)

    data.set([TextureShapeType.Group, OPERATION_MAPPER[g.operation.type], g.operation?.smoothness ?? 0])

    return data
  }

  visitSphere(s: Sphere): Float32Array {
    const data = new Float32Array(16)

    data.set([TextureShapeType.Sphere, s.radius])
    data.set([s.position.x, s.position.y, s.position.z], 4)
    data.set([s.color.x, s.color.y, s.color.z], 8)
    data.set([OPERATION_MAPPER[s.operation.type], s.operation?.smoothness ?? 0], 12)

    return data
  }

  visitBox(b: Box): Float32Array {
    const data = new Float32Array(16)

    data.set([TextureShapeType.Box, b.dimensions.x, b.dimensions.y, b.dimensions.z])
    data.set([b.position.x, b.position.y, b.position.z], 4)
    data.set([b.color.x, b.color.y, b.color.z], 8)
    data.set([OPERATION_MAPPER[b.operation.type], b.operation?.smoothness ?? 0], 12)

    return data
  }

}