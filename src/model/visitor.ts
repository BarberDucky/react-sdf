import { Box, Sphere } from './shapes'
import { Group } from './shape-tree.ts'

export abstract class Visitor<TResult, TExtra> {
  public abstract visitGroup(g: Group, extra?: TExtra): TResult

  public abstract visitSphere(s: Sphere, extra?: TExtra): TResult

  public abstract visitBox(b: Box, extra?: TExtra): TResult
}