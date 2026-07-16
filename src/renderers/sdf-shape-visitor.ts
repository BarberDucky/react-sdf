import { Box, Sphere } from "../model/shapes";
import { Visitor } from "../model/visitor";
import { dedent, floatToGlslFloat, point3ToVec3 } from "../utils";
import { Group } from "../model/shape-tree.ts";

export class SdfShapeVisitor extends Visitor<string, { root: string }> {

  public visitSphere(s: Sphere, extra: { root: string }): string {
    const { root } = extra

    return dedent`
      MaterialDist ${s.id} = MaterialDist(
        ${point3ToVec3(s.color)},
        true,
        sdSphere(p - ${point3ToVec3(s.position)}, ${floatToGlslFloat(s.radius)})
      );

      ${root}.color = ${s.id}.dist < ${root}.dist ? ${s.id}.color : ${root}.color;
      ${root}.isLit = ${s.id}.dist < ${root}.dist ? ${s.id}.isLit : ${root}.isLit;`
  }

  public visitBox(b: Box, extra: { root: string }): string {
    const { root } = extra

    return dedent`
      MaterialDist ${b.id} = MaterialDist(
        ${point3ToVec3(b.color)},
        true,
        sdBox(p - ${point3ToVec3(b.position)}, ${point3ToVec3(b.dimensions)})
      );

      ${root}.color = ${b.id}.dist < ${root}.dist ? ${b.id}.color : ${root}.color;
      ${root}.isLit = ${b.id}.dist < ${root}.dist ? ${b.id}.isLit : ${root}.isLit;`
  }

  public visitGroup(g: Group, extra: { root: string }): string {
    const { root } = extra

    const getOpString = (shapeId: string) => {
      return g.operation.smoothness == null
        ? `${g.id}.dist = opUnion(${g.id}.dist, ${shapeId}.dist);`
        : `${g.id}.dist = opSmoothUnion(${g.id}.dist, ${shapeId}.dist, ${g.operation.smoothness});`
    }

    return dedent`
      MaterialDist ${g.id} = MaterialDist(
        vec3(1.),
        true,
        1000.
      );` +
      g.nodes
        .map(curr => curr.accept(this, { root: g.id }).concat(getOpString(curr.id)))
        .join('') +
      dedent`
      ${root}.color = ${g.id}.dist < ${root}.dist ? ${g.id}.color : ${root}.color;
      ${root}.isLit = ${g.id}.dist < ${root}.dist ? true : ${root}.isLit;`
  }

}