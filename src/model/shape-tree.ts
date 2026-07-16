import { Point3 } from "../utils";
import { Visitor } from "./visitor";

export type Operation =
  | { type: 'union', smoothness?: number }

export abstract class ShapeTreeNode {

  abstract id: string
  abstract type: string
  abstract accept<TResult, TExtra>(v: Visitor<TResult, TExtra>, extra?: TExtra): TResult

  parent: Group | null = null

}

export abstract class Shape extends ShapeTreeNode {
  constructor(
    public id: string,
    public position: Point3,
    public color: Point3,
    public operation: Operation,
  ) { super() }
}

export class Group extends ShapeTreeNode {

  type = 'Group'

  constructor(
    public id: string,
    public operation: Operation,
  ) { super() }

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

  accept<TResult, TExtra>(v: Visitor<TResult, TExtra>, extra?: TExtra): TResult {
    return v.visitGroup(this, extra)
  }
}