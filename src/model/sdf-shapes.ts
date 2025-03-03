import { floatToGlslFloat, point3ToVec3 } from "../utils"
import { Shape, Sphere } from "./shapes"

export abstract class SdfShape {
  abstract get shape(): Shape
  abstract getShaderString: (id: number) => string
}

export class SdfSphere implements SdfShape {

  constructor(
    private _shape: Sphere
  ) { }

  get shape() {
    return this._shape
  }

  getShaderString(id: number) {
    return `
  float sphere${id} = sdSphere(p - ${point3ToVec3(this._shape.position)}, ${floatToGlslFloat(this._shape.radius)});
  res.color = sphere${id} < res.dist ? ${point3ToVec3(this._shape.color)} : res.color;
  res.isLit = sphere${id} < res.dist ? true : res.isLit;
  res.dist = min(res.dist, sphere${id});
  `
  }

}