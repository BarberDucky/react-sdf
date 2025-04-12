import { Box, Sphere } from "../model/shapes";
import { Point3 } from "../utils";
import { UnionOperation } from "./operations";
import { Operation } from "./shape-tree";

export class ShapeController {

  private nextId = 0

  constructor(
    private root: Operation = new UnionOperation('root')
  ) { }

  get rootOperation(): Operation {
    return this.root
  }

  addSphere(position: Point3, radius: number, color: Point3) {
    const sphere = new Sphere(
      'shp' + this.nextId,
      position,
      color,
      radius,
    )
    this.nextId++
    this.root.addNodes(sphere)
  }

  addBox(position: Point3, dimensions: Point3, color: Point3) {
    const box = new Box(
      'shp' + this.nextId,
      position,
      color,
      dimensions,
    )
    this.nextId++
    this.root.addNodes(box)
  }

}