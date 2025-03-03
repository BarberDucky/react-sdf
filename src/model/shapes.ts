import { Point3 } from "../utils";

export interface Shape {
  position: Point3
  color: Point3
}

export interface Sphere extends Shape {
  radius: number
  rotation: number
}