import KeyboardMovementManager from "./keyboard-movement-manager"
import MouseMovementManager from "./mouse-movement-manager"
import { Point2, Point3 } from "./utils"

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
uniform vec3 iLookAt;

uniform vec2 iRotationAngles;

mat2 rot2D(float a) {
    return mat2(cos(a), -sin(a), sin(a), cos(a));
}

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float map(vec3 p) {
  float sphere1 = sdSphere(p - iLookAt, 1.);
  float sphere2 = sdSphere(p - vec3(1.1, 0., 0.), 1.2);

  float d = min(sphere1, sphere2);

  return d;
}

mat3 setCamera(vec3 target, vec3 position) {
  vec3 z = normalize(target - position);
  vec3 x = normalize(cross(z, vec3(0.0, 1.0, 0.0)));
  vec3 y = normalize(cross(x, z));
  return mat3(x, y, z);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2. - iResolution.xy) / iResolution.y;

  vec3 ro = iCameraOrigin;

  float yaw   = iRotationAngles.x * 0.075;
  float pitch = iRotationAngles.y * 0.075;
  float r1    = distance(iLookAt, ro);

  vec3 ta = iLookAt;

  ro = vec3(
      ta.x + r1 * cos(pitch) * sin(yaw),
      ta.y + r1 * sin(pitch),
      ta.z + r1 * cos(pitch) * cos(yaw)
  );
  
  float zoom = 1.;

  vec3 f = normalize(ta-ro);
  vec3 r = normalize(cross(vec3(0., 1., 0.), f));
  vec3 u = normalize(cross(f, r));

  vec3 c = ro + f*zoom;
  vec3 i = c + uv.x*r + uv.y*u;
  // vec3 rd = i-ro;

  mat3 camera = setCamera(ta, ro);

  vec3 rd = normalize(camera * vec3(uv, 1.0));

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
  const uLookAt = gl.getUniformLocation(program, 'iLookAt')

  const uRotationAngles = gl.getUniformLocation(program, 'iRotationAngles')

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

  let cameraOrigin: Point3 = { x: 0, y: 0, z: -3 }
  const CAMERA_SPEED = 0.1
  const PAN_SPEED = 0.01

  let rotationAngles: Point2 = { x: 0, y: 0 }

  mouseMovementManager.addCallback(deltaMove => {
    rotationAngles = {
      x: rotationAngles.x + deltaMove.x * CAMERA_SPEED,
      y: rotationAngles.y + deltaMove.y * CAMERA_SPEED,
    }
  })

  const animate = () => {
    resizeCanvasToDisplaySize(canvas)
    gl.viewport(0, 0, canvas.width, canvas.height)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const direction = keyboardMovementManager.getCurrentDirectionVector()

    rotationAngles = {
      x: rotationAngles.x + direction.x,
      y: rotationAngles.y + direction.z,
    }

    gl.uniform2f(uResolutionLocation, canvas.width, canvas.height)
    gl.uniform3f(uCameraOriginLocation, cameraOrigin.x, cameraOrigin.y, cameraOrigin.z)
    gl.uniform3f(uLookAt, 0, 0, 0)

    gl.uniform2f(uRotationAngles, rotationAngles.x, rotationAngles.y)

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    window.requestAnimationFrame(animate)
  }

  animate()
}

const keyboardMovementManager = new KeyboardMovementManager()
const mouseMovementManager = new MouseMovementManager()