import { Group, ShapeTreeNode } from "./shape-tree";
import { Sphere } from "./shapes";

const op1 = new Group('op1', { type: "union" })
op1.addNodes(
  new Sphere(
    'shp0',
    { x: 0, y: 0, z: 0 },
    { x: 0., y: 0., z: 1. },
    1,
    { type: 'union' },
    0,
  ),
  new Sphere(
    'shp1',
    { x: 0., y: 1.2, z: 0 },
    { x: 1, y: 0, z: 0 },
    1,
    { type: 'union' },
    0,
  ),
)

const op2 = new Group('op2', { type: "union", smoothness: 1.1 })
op2.addNodes(
  op1,
  new Sphere(
    'shp2',
    { x: 1.2, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    1,
    { type: 'union' },
    0,
  ),
)

export const exampleScene1: Array<ShapeTreeNode> = [
  op2,
]