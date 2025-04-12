import { Operation } from "./shape-tree";
import { Visitor } from "./visitor";

export class UnionOperation extends Operation {

  constructor(
    public id: string,
  ) { super() }

  accept(v: Visitor, root: string): string {
    return v.visitUnion(this, root)
  }  
}

export class SmoothUnionOperation extends Operation {

  public smoothness = 0.25;

  constructor(
    public id: string,
  ) { super() }

  accept(v: Visitor, root: string): string {
    return v.visitSmoothUnion(this, root)
  }  
}