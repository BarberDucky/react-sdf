import { Box, Sphere } from "../model/shapes";
import { Point3 } from "../utils";
import { SmoothUnionOperation, UnionOperation } from "./operations";
import { Operation, ShapeTreeNode } from "./shape-tree";

export class ShapeController {

  private lastId = 0

  constructor(
    private root: Operation = new UnionOperation('root')
  ) { }

  get rootOperation(): Operation {
    return this.root
  }

  addSphere(position: Point3, radius: number, color: Point3) {
    const sphere = new Sphere(
      'shp' + this.newId,
      position,
      color,
      radius,
    )
    this.root.addNodes(sphere)
    return sphere
  }

  addBox(position: Point3, dimensions: Point3, color: Point3) {
    const box = new Box(
      'shp' + this.newId,
      position,
      color,
      dimensions,
    )
    this.root.addNodes(box)
    return box
  }

  addUnion() {
    const union = new UnionOperation(
      'op' + this.newId
    )
    this.root.addNodes(union)
    return union
  }

  addSmoothUnion(smoothness: number) {
    const smoothUnion = new SmoothUnionOperation(
      'op' + this.newId,
      smoothness,
    )
    this.root.addNodes(smoothUnion)
    return smoothUnion
  }

  private get newId() {
    const lastId = this.lastId
    this.lastId++
    return lastId
  }

}