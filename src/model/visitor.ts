import { Box, Sphere } from "./shapes";

export abstract class Visitor {
  public abstract visitSphere(s: Sphere): string
  public abstract visitBox(b: Box): string
}