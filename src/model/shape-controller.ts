import { Shape, Sphere } from "../model/shapes";
import { Point3 } from "../utils";

export class ShapeController {

  private nextId = 0

  constructor(
    private _shapes: Array<Shape> = []
  ) { }

  get shapes(): Array<Shape> {
    return this._shapes
  }

  addSphere(position: Point3, radius: number, color: Point3) {
    this.nextId++

    const sphere = new Sphere(
      this.nextId,
      position,
      color,
      radius,
    )

    this._shapes.push(sphere)
  }

}