import { Point3 } from "./utils";
import { vector3Add, vector3Cross, vector3Length, vector3Normalize, vector3Scale, vector3Subtract } from "./vector3";

export class Camera {

  private ROTATE_SPEED = 0.01
  private PAN_SPEED = 0.015
  private ZOOM_SPEED = 0.0045

  public constructor(
    private origin: Point3,
    private target: Point3,
  ) { }

  public zoom(zoomAmount: number) {
    const { origin, target } = this

    const offset = vector3Subtract(origin, target)
    const r = vector3Length(offset)

    const deltaZoom = this.ZOOM_SPEED * zoomAmount

    const clampedDeltaZoom = r + deltaZoom > 1000
      ? 0
      : r + deltaZoom < 0.1
        ? 0
        : deltaZoom
    const scaleFactor = (r + clampedDeltaZoom) / r
    const newOffset = vector3Scale(offset, scaleFactor)

    this.origin = vector3Add(target, newOffset)
  }

  public orbit(deltaTheta: number, deltaPhi: number) {
    const { origin, target } = this

    const offset = vector3Subtract(origin, target)
    const r = vector3Length(offset)

    if (r < 1e-6) {
      return
    }

    const x = offset.x
    const y = offset.y
    const z = offset.z

    let curTheta = Math.atan2(z, x)
    let curPhi = Math.acos(y / r)

    curTheta += deltaTheta * this.ROTATE_SPEED
    curPhi += deltaPhi * this.ROTATE_SPEED

    const EPS = 0.001
    curPhi = Math.max(EPS, Math.min(Math.PI - EPS, curPhi))

    const sinPhi = Math.sin(curPhi)
    const cosPhi = Math.cos(curPhi)
    const cosTheta = Math.cos(curTheta)
    const sinTheta = Math.sin(curTheta)

    const newOffset = {
      x: r * sinPhi * cosTheta,
      y: r * cosPhi,
      z: r * sinPhi * sinTheta,
    }

    this.origin = vector3Add(target, newOffset)
  }

  public pan(deltaX: number, deltaY: number) {
    const { origin, target } = this

    const f = vector3Normalize(vector3Subtract(target, origin))
    const r = vector3Normalize(vector3Cross(f, { x: 0, y: 1, z: 0 }))
    const u = vector3Cross(r, f)

    const offset = vector3Add(
      vector3Scale(r, -deltaX * this.PAN_SPEED),
      vector3Scale(u, -deltaY * this.PAN_SPEED),
    )

    this.origin = vector3Add(this.origin, offset)
    this.target = vector3Add(this.target, offset)
  }

  public getOrigin() { return this.origin }
  public getTarget() { return this.target }
} 