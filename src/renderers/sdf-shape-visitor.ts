import { Sphere } from "../model/shapes";
import { Visitor } from "../model/visitor";
import { dedent, floatToGlslFloat, point3ToVec3 } from "../utils";

export class SdfShapeVisitor extends Visitor {

  public visitSphere(s: Sphere): string {
    return dedent`
      float sphere${s.id} = sdSphere(p - ${point3ToVec3(s.position)}, ${floatToGlslFloat(s.radius)});
      res.color = sphere${s.id} < res.dist ? ${point3ToVec3(s.color)} : res.color;
      res.isLit = sphere${s.id} < res.dist ? true : res.isLit;
      res.dist = min(res.dist, sphere${s.id});`
  }

}