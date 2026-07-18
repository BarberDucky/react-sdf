import { Box, Sphere } from "./shapes.ts";
import { Point3 } from "../utils";
import { Group, Operation, ShapeTreeNode } from "./shape-tree";

export interface FlatShapeListEntry {
  id: string,
  depth: number,
  type: string,
  node: ShapeTreeNode,
}

export class ShapeController {

  private lastId = 0

  constructor(
    private root: Group = new Group('root', { type: 'union' })
  ) { }

  get rootOperation(): Group {
    return this.root
  }

  get flatShapeList(): Array<FlatShapeListEntry> {

    const queue: Array<{ depth: number, node: ShapeTreeNode }> = [{ depth: 0, node: this.root }]
    const res: Array<FlatShapeListEntry> = []

    while (queue.length > 0) {
      const curr = queue.pop()!
      res.push({
        id: curr.node.id,
        type: curr.node.type,
        depth: curr.depth,
        node: curr.node,
      })

      if (curr.node instanceof Group) {
        for (let i = curr.node.nodes.length - 1; i >= 0; i--) {
          queue.push({
            node: curr.node.nodes[i],
            depth: curr.depth + 1
          })
        }
      }
    }

    return res
  }

  getShapeById(id: string): ShapeTreeNode | undefined {
    return this.flatShapeList.find(element => element.id == id)?.node
  }

  addSphere(position: Point3, radius: number, color: Point3, operation: Operation, roundness: number) {
    const sphere = new Sphere(
      'shp' + this.newId,
      position,
      color,
      radius,
      operation,
      roundness,
    )
    this.root.addNodes(sphere)
    return sphere
  }

  addBox(position: Point3, dimensions: Point3, color: Point3, operation: Operation, roundness: number) {
    const box = new Box(
      'shp' + this.newId,
      position,
      color,
      dimensions,
      operation,
      roundness,
    )
    this.root.addNodes(box)
    return box
  }

  addGroup(operation: Operation) {
    const group = new Group(
      'g' + this.newId,
      operation,
    )
    this.root.addNodes(group)
    return group
  }

  private get newId() {
    const lastId = this.lastId
    this.lastId++
    return lastId
  }

}