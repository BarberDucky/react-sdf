import { Point3 } from "../utils";
import { Visitor } from "./visitor";

export abstract class Shape {
  constructor(
    public id: number,
    public position: Point3,
    public color: Point3,
  ) { }

  abstract accept(v: Visitor): string
}

export class Sphere extends Shape {
  constructor(
    public id: number,
    public position: Point3,
    public color: Point3,
    public radius: number
  ) {
    super(id, position, color)
  }

  accept(v: Visitor): string {
    return v.visitSphere(this)
  }

}