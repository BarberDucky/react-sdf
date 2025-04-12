import { SmoothUnionOperation, UnionOperation } from "../model/operations";
import { Box, Sphere } from "../model/shapes";
import { Visitor } from "../model/visitor";
import { dedent, floatToGlslFloat, point3ToVec3 } from "../utils";

export class SdfShapeVisitor extends Visitor {

  public visitSphere(s: Sphere, root: string): string {
    return dedent`
      MaterialDist ${s.id} = MaterialDist(
        ${point3ToVec3(s.color)},
        true,
        sdSphere(p - ${point3ToVec3(s.position)}, ${floatToGlslFloat(s.radius)})
      );

      ${root}.color = ${s.id}.dist < ${root}.dist ? ${s.id}.color : ${root}.color;
      ${root}.isLit = ${s.id}.dist < ${root}.dist ? ${s.id}.isLit : ${root}.isLit;`
  }

  public visitBox(b: Box, root: string): string {
    return dedent`
      MaterialDist ${b.id} = MaterialDist(
        ${point3ToVec3(b.color)},
        true,
        sdBox(p - ${point3ToVec3(b.position)}, ${point3ToVec3(b.dimensions)})
      );

      ${root}.color = ${b.id}.dist < ${root}.dist ? ${b.id}.color : ${root}.color;
      ${root}.isLit = ${b.id}.dist < ${root}.dist ? ${b.id}.isLit : ${root}.isLit;`
  }

  public visitUnion(u: UnionOperation, root: string): string {
    return dedent`
      MaterialDist ${u.id} = MaterialDist(
        vec3(1.),
        true,
        1000.
      );` +
    u.nodes
    .map(curr => curr.accept(this, u.id).concat(`${u.id}.dist = opUnion(${u.id}.dist, ${curr.id}.dist);`))
    .join('') +
    dedent`
      ${root}.color = ${u.id}.dist < ${root}.dist ? ${u.id}.color : ${root}.color;
      ${root}.isLit = ${u.id}.dist < ${root}.dist ? true : ${root}.isLit;`
  }

  public visitSmoothUnion(u: SmoothUnionOperation, root: string): string {
     return dedent`
      MaterialDist ${u.id} = MaterialDist(
        vec3(1.),
        true,
        1000.
      );` +
    u.nodes
    .map(curr => curr.accept(this, u.id).concat(`${u.id}.dist = opSmoothUnion(${u.id}.dist, ${curr.id}.dist, ${u.smoothness});`))
    .join('') +
    dedent`
      ${root}.color = ${u.id}.dist < ${root}.dist ? ${u.id}.color : ${root}.color;
      ${root}.isLit = ${u.id}.dist < ${root}.dist ? true : ${root}.isLit;`
  }

}