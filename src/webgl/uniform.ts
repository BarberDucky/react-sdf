import { Point2, Point3 } from '../utils.ts'

export abstract class Uniform<T> {
  constructor(
    public location: WebGLUniformLocation,
    public value: T,
  ) { }

  public abstract accept(gl: WebGL2RenderingContext): void
}

export class Uniform1i extends Uniform<number> {
  accept(gl: WebGL2RenderingContext) {
    gl.uniform1i(this.location, this.value)
  }
}

export class Uniform2f extends Uniform<Point2> {
  accept(gl: WebGL2RenderingContext) {
    gl.uniform2f(this.location, this.value.x, this.value.y)
  }
}

export class Uniform3f extends Uniform<Point3> {
  accept(gl: WebGL2RenderingContext) {
    gl.uniform3f(this.location, this.value.x, this.value.y, this.value.z)
  }
}

export class UniformBool extends Uniform<boolean> {
  accept(gl: WebGL2RenderingContext) {
    gl.uniform1i(this.location, this.value ? 1 : 0)
  }
}

export interface UniformTypeMap {
  '1i': { value: number; instance: Uniform1i }
  '2f': { value: Point2; instance: Uniform2f }
  '3f': { value: Point3; instance: Uniform3f }
  'bool': { value: boolean; instance: UniformBool }
}

export type UniformType = keyof UniformTypeMap

export type UniformTypeValue = {
  [K in UniformType]: { type: K; value: UniformTypeMap[K]['value'] }
}[UniformType]