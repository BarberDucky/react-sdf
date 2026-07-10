import { SmoothUnionOperation, UnionOperation } from "./operations";
import { Box, Sphere } from "./shapes";

export abstract class Visitor<TResult, TExtra> {
  public abstract visitSphere(s: Sphere, extra?: TExtra): TResult
  public abstract visitBox(b: Box, extra?: TExtra): TResult
  public abstract visitUnion(u: UnionOperation, extra?: TExtra): TResult
  public abstract visitSmoothUnion(u: SmoothUnionOperation, extra?: TExtra): TResult
}