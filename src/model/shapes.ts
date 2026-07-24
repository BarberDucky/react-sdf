import { Point3 } from "../utils";
import { Operation, Shape } from "./shape-tree";
import { Visitor } from "./visitor";

export class Sphere extends Shape {
  
  type = 'Sphere'
  
  constructor(
    public id: string,
    public position: Point3,
    public rotation: Point3,
    public scale: number,
    public color: Point3,
    public radius: number,
    public operation: Operation,
    public roundness: number,
  ) {
    super(id, position, rotation, scale, color, operation, roundness)
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
    public rotation: Point3,
    public scale: number,
    public color: Point3,
    public dimensions: Point3,
    public operation: Operation,
    public roundness: number,
  ) {
    super(id, position, rotation, scale, color, operation, roundness)
  }

  accept<TResult, TExtra>(v: Visitor<TResult, TExtra>, extra?: TExtra): TResult {
    return v.visitBox(this, extra)
  }

}