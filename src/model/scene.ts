import { SdfShape, SdfSphere } from "./sdf-shapes";

export const scene: Array<SdfShape> = [
  new SdfSphere({
    color: { x: 0., y: 0., z: 1. },
    position: { x: 0, y: 0, z: 0 },
    radius: 1,
    rotation: 0,
  }),

  new SdfSphere({
    color: { x: 1., y: 0., z: 0. },
    position: { x: 0, y: 1.2, z: 0 },
    radius: 1,
    rotation: 0,
  }),
  
  new SdfSphere({
    color: { x: 0., y: 1., z: 0. },
    position: { x: 1.2, y: 0, z: 0 },
    radius: 1,
    rotation: 0,
  }),
]