import { Point3 } from "../utils";
import { Visitor } from "./visitor";

export abstract class ShapeTreeNode {

  abstract id: string
  abstract accept(v: Visitor, parent: string): string

  parent: Operation | null = null

}

export abstract class Shape extends ShapeTreeNode {
  constructor(
    public id: string,
    public position: Point3,
    public color: Point3,
  ) { super() }
}

export abstract class Operation extends ShapeTreeNode {

  private shapeNodes: Array<ShapeTreeNode> = []

  public get nodes() {
    return this.shapeNodes
  }

  public addNodes(...n: ShapeTreeNode[]) {
    n.forEach(node => {
      node.parent?.removeNode(node)
      node.parent = this
    })
    this.shapeNodes.push(...n)
  }

  public removeNode(n: ShapeTreeNode) {
    n.parent = null
    this.shapeNodes = this.shapeNodes.filter(e => e != n)
  }

}