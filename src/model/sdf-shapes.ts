import { floatToGlslFloat, point3ToVec3 } from "../utils"
import { Shape, Sphere } from "./shapes"

export class SdfRenderer {

  getShaderString(shape: Shape, id: number): string {
    if (shape instanceof Sphere) {
      return this.getSphereShaderString(shape, id)
    } else {
      console.warn(`Shape type ${typeof shape} not defined for SDF renderer.`)
      return ''
    }
  }

  getSphereShaderString(sphere: Sphere, id: number) {
    return `
  float sphere${id} = sdSphere(p - ${point3ToVec3(sphere.position)}, ${floatToGlslFloat(sphere.radius)});
  res.color = sphere${id} < res.dist ? ${point3ToVec3(sphere.color)} : res.color;
  res.isLit = sphere${id} < res.dist ? true : res.isLit;
  res.dist = min(res.dist, sphere${id});
  `
  }

}