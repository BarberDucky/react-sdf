import { Point2, Point3 } from '../utils'
import { createContext, createProgram, createShader } from './helpers.ts'

import defaultVertexShader from '../renderers/shaders/default.vertex.glsl?raw'
import sceneFragmentShader from '../renderers/shaders/scene.fragment.glsl?raw'

type UniformValue =
  | { type: '1i', value: number }
  | { type: '2f', value: Point2 }
  | { type: '3f', value: Point3 }
  | { type: 'bool', value: boolean }

export interface Uniform {
  updateLocation: (value: WebGLUniformLocation) => void
  accept: (gl: WebGL2RenderingContext) => void
}

export class Uniform1i implements Uniform {
  constructor(
    private _location: WebGLUniformLocation,
    private _value: number,
  ) { }

  updateLocation(value: WebGLUniformLocation) {
    this._location = (value)
  }

  updateValue(value: number) {
    this._value = value
  }

  accept(gl: WebGL2RenderingContext) {
    gl.uniform1i(this._location, this._value)
  }
}

export class Uniform2f implements Uniform {
  constructor(
    private _location: WebGLUniformLocation,
    private _value: Point2,
  ) { }

  updateLocation(value: WebGLUniformLocation) {
    this._location = (value)
  }

  updateValue(value: Point2) {
    this._value = value
  }

  accept(gl: WebGL2RenderingContext) {
    gl.uniform2f(this._location, this._value.x, this._value.y)
  }
}

export class Uniform3f implements Uniform {
  constructor(
    private _location: WebGLUniformLocation,
    private _value: Point3,
  ) { }

  updateLocation(value: WebGLUniformLocation) {
    this._location = (value)
  }

  updateValue(value: Point3) {
    this._value = value
  }

  accept(gl: WebGL2RenderingContext) {
    gl.uniform3f(this._location, this._value.x, this._value.y, this._value.z)
  }
}

export class UniformBool implements Uniform {
  constructor(
    private _location: WebGLUniformLocation,
    private _value: boolean,
  ) { }

  updateLocation(value: WebGLUniformLocation) {
    this._location = (value)
  }

  updateValue(value: boolean) {
    this._value = value
  }

  accept(gl: WebGL2RenderingContext) {
    gl.uniform1i(this._location, this._value ? 1 : 0)
  }
}

export class WebGlContext {

  private _gl: WebGL2RenderingContext
  private _vertexShader: WebGLShader
  private _fragmentShader: WebGLShader
  private _program: WebGLProgram

  private _maxTextureCount = 4

  private _uniforms: Map<string, Uniform> = new Map()
  private _textureUniforms: Array<WebGLUniformLocation> = []
  private _textures: Array<WebGLTexture> = []

  constructor(
    canvas: HTMLCanvasElement,
  ) {
    this._gl = createContext(canvas)
    this._vertexShader = createShader(this._gl, this._gl.VERTEX_SHADER, defaultVertexShader)
    this._fragmentShader = createShader(this._gl, this._gl.FRAGMENT_SHADER, sceneFragmentShader)
    this._program = createProgram(this._gl, this._vertexShader, this._fragmentShader)
    this.initializeViewport()
    this.initializeTextureUniforms()
  }

  private initializeViewport() {
    const positionAttributeLocation = this._gl.getAttribLocation(this._program, 'a_position')

    const positionBuffer = this._gl.createBuffer()
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, positionBuffer)
    const positions = [
      -1, 1,
      1, 1,
      -1, -1,
      1, 1,
      1, -1,
      -1, -1,
    ]
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(positions), this._gl.STATIC_DRAW)

    const vao = this._gl.createVertexArray()
    this._gl.bindVertexArray(vao)
    this._gl.enableVertexAttribArray(positionAttributeLocation)

    const size = 2
    const type = this._gl.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0
    this._gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

    this._gl.useProgram(this._program)
  }

  public requestDraw() {
    for (const uniform of this._uniforms.values()) {
      uniform.accept(this._gl)
    }

    for (let i = 0; i < this._maxTextureCount; i++) {
      this._gl.activeTexture(this._gl.TEXTURE0 + i + 1)
      this._gl.bindTexture(this._gl.TEXTURE_2D, this._textures[i])
    }

    this._gl.drawArrays(this._gl.TRIANGLES, 0, 6)
  }

  public resizeViewport(width: number, height: number) {
    this._gl.viewport(0, 0, width, height)
  }

  public registerUniform(name: string, value: UniformValue): Uniform {
    const location = this._gl.getUniformLocation(this._program, name)

    const uniform = value.type == '2f'
      ? new Uniform2f(location!, value.value)
      : value.type == '3f'
        ? new Uniform3f(location!, value.value)
        : value.type == 'bool'
          ? new UniformBool(location!, value.value)
          : new Uniform1i(location!, value.value)

    this._uniforms.set(name, uniform)
    return uniform
  }

  public createDataTexture() {
    const newTexture = this._gl.createTexture()

    if (newTexture == null) {
      this._gl.deleteTexture(newTexture)
      throw new Error(`Error while creating texture. Likely, the WebGL context is lost.`)
    }

    this._textures.push(newTexture)
    return newTexture
  }

  public setDataTexture(texture: WebGLTexture, data: Float32Array, width: number, height: number) {
    this._gl.activeTexture(this._gl.TEXTURE0)
    this._gl.bindTexture(this._gl.TEXTURE_2D, texture)

    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.NEAREST)
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.NEAREST)

    this._gl.texImage2D(
      this._gl.TEXTURE_2D,
      0,
      this._gl.RGBA32F,
      width,
      height,
      0,
      this._gl.RGBA,
      this._gl.FLOAT,
      data,
    )
  }

  private initializeTextureUniforms() {
    for (let i = 0; i < this._maxTextureCount; i++) {
      const location = this._gl.getUniformLocation(this._program, `iSampler${i + 1}`)
      this._gl.uniform1i(location, i + 1)
      this._textureUniforms.push(location!)
    }
  }

}