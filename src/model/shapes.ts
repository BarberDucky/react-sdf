import { Point3 } from "../utils";
import { Shape } from "./shape-tree";
import { Visitor } from "./visitor";

export class Sphere extends Shape {
  
  type = 'Sphere'
  
  constructor(
    public id: string,
    public position: Point3,
    public color: Point3,
    public radius: number
  ) {
    super(id, position, color)
  }

  accept<TResult, TExtra>(v: Visitor<TResult, TExtra>, extra?: TExtra): TResult {
    return v.visitSphere(this, extra)
  }

}

export class Box extends Shape {
  
  type = 'Box'
  
  constructor(
    public id: string,
    public position: Point3,
    public color: Point3,
    public dimensions: Point3,
  ) {
    super(id, position, color)
  }

  accept<TResult, TExtra>(v: Visitor<TResult, TExtra>, extra?: TExtra): TResult {
    return v.visitBox(this, extra)
  }

}