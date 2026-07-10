import { Operation } from "./shape-tree";
import { Visitor } from "./visitor";

export class UnionOperation extends Operation {

  type = 'Union'

  constructor(
    public id: string,
  ) { super() }

  accept<TResult, TExtra>(v: Visitor<TResult, TExtra>, extra?: TExtra): TResult {
    return v.visitUnion(this, extra)
  }
}

export class SmoothUnionOperation extends Operation {

  type = 'Smooth Union'

  constructor(
    public id: string,
    public smoothness: number,
  ) { super() }

  accept<TResult, TExtra>(v: Visitor<TResult, TExtra>, extra?: TExtra): TResult {
    return v.visitSmoothUnion(this, extra)
  }
}