import { SmoothUnionOperation, UnionOperation } from "../model/operations";
import { Box, Sphere } from "../model/shapes";
import { Visitor } from "../model/visitor";

enum TextureShapeType {
  Sphere = 0,
  Box = 1,
  Union = 2,
  SmoothUnion = 3
}

export class DataTextureVisitor extends Visitor<Float32Array, undefined> {

  visitSphere(s: Sphere): Float32Array {
    const data = new Float32Array(12)

    data.set([TextureShapeType.Sphere, s.radius])
    data.set([s.position.x, s.position.y, s.position.z], 4)
    data.set([s.color.x, s.color.y, s.color.z], 8)

    return data
  }

  visitBox(b: Box): Float32Array {
    const data = new Float32Array(12)

    data.set([TextureShapeType.Sphere, b.dimensions.x, b.dimensions.y, b.dimensions.z])
    data.set([b.position.x, b.position.y, b.position.z], 4)
    data.set([b.color.x, b.color.y, b.color.z], 8)

    return data
  }

  visitUnion(u: UnionOperation): Float32Array {
    const data = new Float32Array(12)

    data.set([TextureShapeType.Sphere])

    return data
  }

  visitSmoothUnion(u: SmoothUnionOperation): Float32Array {
    const data = new Float32Array(12)

    data.set([TextureShapeType.Sphere, u.smoothness])

    return data
  }

}