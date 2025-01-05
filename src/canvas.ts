const vertexSource = `#version 300 es

in vec4 a_position;

void main() {
  gl_Position = a_position;
}`

const fragmentSource = `#version 300 es

precision highp float;

out vec4 outColor;

uniform vec2 iResolution;
uniform vec3 iCameraOrigin;

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float map(vec3 p) {
  float sphere1 = sdSphere(p, 1.);
  float sphere2 = sdSphere(p - vec3(1.1, 0., 0.), 1.2);

  float d = min(sphere1, sphere2);

  return d;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2. - iResolution.xy) / iResolution.y;

  vec3 ro = iCameraOrigin;
  vec3 rd = normalize(vec3(uv, 1.));
  vec3 col = vec3(0.);

  float t = 0.;

  for (int i = 0; i < 80; i++) {
    vec3 p = ro + rd * t;

    float d = map(p);

    t += d;

    if (d < .001 || t > 100.) break;
  }

  col = vec3(t * .2);

  outColor = vec4(col, 1.);
}`

function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string) {
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
  throw new Error(`Error while compiling vertex or fragment shader. Full info log: ${errorInfo}`)
}

function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram()
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

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const displayWidth = canvas.clientWidth
  const displayHeight = canvas.clientHeight

  const needResize =
    canvas.width !== displayWidth ||
    canvas.height !== displayHeight

  if (needResize) {
    canvas.width = displayWidth
    canvas.height = displayHeight
  }

  return needResize
}

export function canvasSetup(canvas: HTMLCanvasElement | null) {
  if (canvas == null) {
    throw new Error(`Supplied canvas doesn't exist.`)
  }

  const gl = canvas.getContext('webgl2')
  if (gl == null) {
    throw new Error(`Supplied canvas doesn't support WebGL2`)
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

  const program = createProgram(gl, vertexShader, fragmentShader)

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
  const uResolutionLocation = gl.getUniformLocation(program, 'iResolution')
  const uCameraOriginLocation = gl.getUniformLocation(program, 'iCameraOrigin')

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  const positions = [
    -1, 1,
    1, 1,
    -1, -1,
    1, 1,
    1, -1,
    -1, -1,
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  gl.enableVertexAttribArray(positionAttributeLocation)

  const size = 2
  const type = gl.FLOAT
  const normalize = false
  const stride = 0
  const offset = 0
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  gl.useProgram(program)

  gl.bindVertexArray(vao)

  let cameraOrigin: vec3 = [0, 0, -3]
  const CAMERA_SPEED = 0.05

  const animate = () => {
    resizeCanvasToDisplaySize(canvas)
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const direction = getCurrentDirectionVector()

    const length = Math.sqrt(direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2);
    if (length > 0) {
      direction[0] /= length;
      direction[1] /= length;
      direction[2] /= length;
    }

    cameraOrigin = cameraOrigin.map((value, index) => value + direction[index] * CAMERA_SPEED) as vec3

    gl.uniform2f(uResolutionLocation, canvas.width, canvas.height)
    gl.uniform3f(uCameraOriginLocation, cameraOrigin[0], cameraOrigin[1], cameraOrigin[2])

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    window.requestAnimationFrame(animate)
  }

  animate()
}

type Movements =
  'Forward' |
  'Backward' |
  'Left' |
  'Right' |
  'Up' |
  'Down'

const KEY_TO_MOVEMENT_MAP: Record<string, Movements | undefined> = {
  ['w']: 'Forward',
  ['W']: 'Forward',
  ['ArrowUp']: 'Forward',

  ['s']: 'Backward',
  ['S']: 'Backward',
  ['ArrowDown']: 'Backward',

  ['a']: 'Left',
  ['A']: 'Left',
  ['ArrowLeft']: 'Left',

  ['d']: 'Right',
  ['D']: 'Right',
  ['ArrowRight']: 'Right',

  [' ']: 'Up',

  ['Shift']: 'Down',
}

type vec3 = [number, number, number]

const MOVEMENT_TO_VECTOR_MAP: Record<Movements, vec3> = {
  ['Forward']: [0, 0, 1],
  ['Backward']: [0, 0, -1],
  ['Left']: [-1, 0, 0],
  ['Right']: [1, 0, 0],
  ['Up']: [0, 1, 0],
  ['Down']: [0, -1, 0],
}

let activeMovements: Record<Movements, boolean> = {
  ['Forward']: false,
  ['Backward']: false,
  ['Left']: false,
  ['Right']: false,
  ['Up']: false,
  ['Down']: false,
}

document.addEventListener('keydown', e => {
  const pressedKey = KEY_TO_MOVEMENT_MAP[e.key]

  if (pressedKey == null) { return }

  activeMovements[pressedKey] = true
})

document.addEventListener('keyup', e => {
  const pressedKey = KEY_TO_MOVEMENT_MAP[e.key]

  if (pressedKey == null) { return }

  activeMovements[pressedKey] = false
})

window.addEventListener('blur', () => {
  for (let movement in activeMovements) {
    activeMovements[movement as Movements] = false
  }
})

window.addEventListener('contextmenu', () => {
  for (let movement in activeMovements) {
    activeMovements[movement as Movements] = false
  }
})

function getCurrentDirectionVector(): vec3 {
  let directionVector: vec3 = [0, 0, 0]

  for (const movement in MOVEMENT_TO_VECTOR_MAP) {
    if (activeMovements[movement as Movements]) {
      const movementVector = MOVEMENT_TO_VECTOR_MAP[movement as Movements]
      directionVector = directionVector.map((value, index) => value + movementVector[index]) as vec3
    }
  }

  return directionVector
}