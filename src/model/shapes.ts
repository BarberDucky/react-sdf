import { Point3 } from "../utils";
import { Shape } from "./shape-tree";
import { Visitor } from "./visitor";

export class Sphere extends Shape {
  constructor(
    public id: string,
    public position: Point3,
    public color: Point3,
    public radius: number
  ) {
    super(id, position, color)
  }

  accept(v: Visitor, root: string): string {
    return v.visitSphere(this, root)
  }

}

export class Box extends Shape {
  constructor(
    public id: string,
    public position: Point3,
    public color: Point3,
    public dimensions: Point3,
  ) {
    super(id, position, color)
  }

  accept(v: Visitor, root: string): string {
    return v.visitBox(this, root)
  }

}