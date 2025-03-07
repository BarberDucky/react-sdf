import { Shape, Sphere } from "../model/shapes";
import { Point3 } from "../utils";

export class ShapeController {

  constructor(
    private _shapes: Array<Shape> = []
  ) { }

  get shapes(): Array<Shape> {
    return this._shapes
  }

  addSphere(position: Point3, radius: number, color: Point3) {
    const sphere = new Sphere(
      position,
      color,
      radius,
    )

    this._shapes.push(sphere)
  }

}