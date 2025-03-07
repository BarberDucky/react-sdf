import { Shape, Sphere } from "./shapes";

export const exampleScene1: Array<Shape> = [
  new Sphere(
    { x: 0, y: 0, z: 0 },
    { x: 0., y: 0., z: 1. },
    1,
  ),
  new Sphere(
    { x: 0., y: 1.2, z: 0 },
    { x: 1, y: 0, z: 0 },
    1,
  ),
  new Sphere(
    { x: 1.2, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    1,
  ),
]