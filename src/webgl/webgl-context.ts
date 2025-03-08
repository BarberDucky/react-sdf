import { Point2, Point3 } from "../utils"

type UniformValue = 
  | { type: '2f', value: Point2 }
  | { type: '3f', value: Point3 }

export interface Uniform {
  updateLocation: (value: WebGLUniformLocation) => void
  accept: (gl: WebGL2RenderingContext) => void
}

export class Uniform2f implements Uniform {
  constructor(
    private _location: WebGLUniformLocation, 
    private _value: Point2,
  ) {}

  updateLocation (value: WebGLUniformLocation) {
    this._location = (value)
  }

  updateValue (value: Point2) {
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
  ) {}

  updateLocation (value: WebGLUniformLocation) {
    this._location = (value)
  }

  updateValue (value: Point3) {
    this._value = value
  }

  accept(gl: WebGL2RenderingContext) {
    gl.uniform3f(this._location, this._value.x, this._value.y, this._value.z)
  }
}

export class WebGlContext {

  private _gl: WebGL2RenderingContext
  private _vertexShader: WebGLShader
  private _fragmentShader: WebGLShader
  private _program: WebGLProgram

  private _uniforms: Map<string, Uniform> = new Map()

  constructor(
    canvas: HTMLCanvasElement,
    vertexShaderSource: string,
    fragmentShaderSource: string,
  ) {
    this._gl = this.createContext(canvas)
    this._vertexShader = this.createShader(this._gl.VERTEX_SHADER, vertexShaderSource)
    this._fragmentShader = this.createShader(this._gl.FRAGMENT_SHADER, fragmentShaderSource)
    this._program = this.createProgram(this._vertexShader, this._fragmentShader)
    this.initializeViewport()
  }

  public requestDraw() {
    for (const uniform of this._uniforms.values()) {
      uniform.accept(this._gl)
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
      : new Uniform3f(location!, value.value)
    
    this._uniforms.set(name, uniform)
    return uniform
  }

  public recompileFragmentShader(source: string) {
    this._gl.detachShader(this._program, this._fragmentShader)
    this._gl.deleteShader(this._fragmentShader)

    this._fragmentShader = this.createShader(this._gl.FRAGMENT_SHADER, source)
    this._gl.attachShader(this._program, this._fragmentShader)
    this._gl.linkProgram(this._program)

    const success = this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)

    if (success) {
      this.reallocateUniforms()
      return this._program
    }

    const errorInfo = this._gl.getProgramInfoLog(this._program)
    this._gl.deleteProgram(this._program)
    throw new Error(`Error while linking program. Full info log: ${errorInfo}`)
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

    this._gl.bindVertexArray(vao)
  }

  private createContext(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2')
    if (gl == null) {
      throw new Error(`Supplied canvas doesn't support WebGL2`)
    }
    return gl
  }

  private createShader(type: GLenum, source: string) {
    const shader = this._gl.createShader(type)

    if (shader == null) {
      throw new Error(`Shader type not supported`)
    }

    this._gl.shaderSource(shader, source)
    this._gl.compileShader(shader)
    const success = this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)

    if (success) {
      return shader
    }

    const errorInfo = this._gl.getShaderInfoLog(shader)
    this._gl.deleteShader(shader)

    console.log(source)

    throw new Error(`Error while compiling vertex or fragment shader. Full info log: ${errorInfo}`)
  }

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = this._gl.createProgram()
    this._gl.attachShader(program, vertexShader)
    this._gl.attachShader(program, fragmentShader)
    this._gl.linkProgram(program)

    const success = this._gl.getProgramParameter(program, this._gl.LINK_STATUS)

    if (success) {
      return program
    }

    const errorInfo = this._gl.getProgramInfoLog(program)
    this._gl.deleteProgram(program)
    throw new Error(`Error while linking program. Full info log: ${errorInfo}`)
  }

  private reallocateUniforms() {
    this._uniforms.forEach((value, key) => {
      value.updateLocation(this._gl.getUniformLocation(this._program, key)!)
    })
  }

}