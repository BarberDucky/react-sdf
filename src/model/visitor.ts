import { Group } from "./shape-tree";
import { Box, Sphere } from "./shapes";

export abstract class Visitor<TResult, TExtra> {
  public abstract visitGroup(g: Group, extra?: TExtra): TResult
  public abstract visitSphere(s: Sphere, extra?: TExtra): TResult
  public abstract visitBox(b: Box, extra?: TExtra): TResult
}