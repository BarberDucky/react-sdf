import { Sphere } from "./shapes";

export abstract class Visitor {
  public abstract visitSphere(s: Sphere): string
}