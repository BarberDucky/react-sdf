import { SmoothUnionOperation, UnionOperation } from "./operations";
import { Box, Sphere } from "./shapes";

export abstract class Visitor {
  public abstract visitSphere(s: Sphere, root: string): string
  public abstract visitBox(b: Box, root: string): string
  public abstract visitUnion(u: UnionOperation, root: string): string
  public abstract visitSmoothUnion(u: SmoothUnionOperation, root: string): string
}