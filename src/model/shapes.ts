import { Point3 } from "../utils";

export abstract class Shape {
  constructor(
    public position: Point3,
    public color: Point3,
  ) { }
}

export class Sphere extends Shape {
  constructor(
    public position: Point3,
    public color: Point3,
    public radius: number
  ) {
    super(position, color)
  }
}