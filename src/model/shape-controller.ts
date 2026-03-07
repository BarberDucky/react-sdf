import { Box, Sphere } from "../model/shapes";
import { Point3 } from "../utils";
import { SmoothUnionOperation, UnionOperation } from "./operations";
import { Operation, Shape, ShapeTreeNode } from "./shape-tree";

export interface FlatShapeListEntry {
  id: string,
  depth: number,
  type: string,
  node: ShapeTreeNode,
}

export class ShapeController {

  private lastId = 0

  constructor(
    private root: Operation = new SmoothUnionOperation('root', 1.1)
  ) { }

  get rootOperation(): Operation {
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

      if (curr.node instanceof Operation) {
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

  addSphere(position: Point3, radius: number, color: Point3) {
    const sphere = new Sphere(
      'shp' + this.newId,
      position,
      color,
      radius,
    )
    this.root.addNodes(sphere)
    return sphere
  }

  addBox(position: Point3, dimensions: Point3, color: Point3) {
    const box = new Box(
      'shp' + this.newId,
      position,
      color,
      dimensions,
    )
    this.root.addNodes(box)
    return box
  }

  addUnion() {
    const union = new UnionOperation(
      'op' + this.newId
    )
    this.root.addNodes(union)
    return union
  }

  addSmoothUnion(smoothness: number) {
    const smoothUnion = new SmoothUnionOperation(
      'op' + this.newId,
      smoothness,
    )
    this.root.addNodes(smoothUnion)
    return smoothUnion
  }

  private get newId() {
    const lastId = this.lastId
    this.lastId++
    return lastId
  }

}