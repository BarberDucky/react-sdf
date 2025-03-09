import { Point3 } from "../utils";

export abstract class AbstractUiBindings {

  abstract createSphere(
    position: Point3,
    radius: number,
    color: Point3,
  ): void

}