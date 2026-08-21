export function createContext(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl2')
  if (gl == null) {
    throw new Error(`Supplied canvas doesn't support WebGL2`)
  }

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  return gl
}

export function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader {
  const shader = gl.createShader(type)

  if (shader == null) {
    throw new Error(`Shader type not supported`)
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)

  if (success) {
    return shader
  }

  const errorInfo = gl.getShaderInfoLog(shader)
  gl.deleteShader(shader)

  console.log(source)

  throw new Error(`Error while compiling vertex or fragment shader. Full info log: ${errorInfo}`)
}

export function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram()

  if (program == null) {
    gl.deleteProgram(program)
    throw new Error(`Error while creating program. Likely, the WebGL context is lost.`)
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  const success = gl.getProgramParameter(program, gl.LINK_STATUS)

  if (success) {
    return program
  }

  const errorInfo = gl.getProgramInfoLog(program)
  gl.deleteProgram(program)
  throw new Error(`Error while linking program. Full info log: ${errorInfo}`)
}
