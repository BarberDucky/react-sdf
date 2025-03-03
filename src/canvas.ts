import { Camera } from "./camera"
import KeyboardMovementManager from "./keyboard-movement-manager"
import { scene } from "./model/scene"
import MouseMovementManager from "./mouse-movement-manager"

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

struct MaterialDist {
  vec3 color;
  bool isLit;
  float dist;
};

vec3 rot3D( vec3 p, vec3 axis, float angle ) {
  return mix(dot(axis, p) * axis, p, cos(angle)) + cross(axis, p) * sin(angle);
}

mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float sdCylinder( vec3 p, vec3 c )
{
  return length(p.xz-c.xy)-c.z;
}

float opLineRepetition( in vec3 p, in vec3 s, vec3 c )
{
  vec3 q = p - s*round(p/s);
  return sdCylinder( q, c );
}

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

MaterialDist map(vec3 p) {

  vec3 xPos = p;
  vec3 yPos = p;
  vec3 zPos = p;
  
  xPos.yz *= rot2D(3.14 / 2.);
  zPos.xy *= rot2D(3.14 / 2.);

  float xAxis = sdCylinder(xPos, vec3(.005));
  float yAxis = sdCylinder(yPos, vec3(.005));
  float zAxis = sdCylinder(zPos, vec3(.005));

  float xAxisRepeat = opLineRepetition(xPos, vec3(.25, 0., 0.), vec3(.001));
  float zAxisRepeat = opLineRepetition(zPos, vec3(0., 0., .25), vec3(.001));

  MaterialDist res = MaterialDist(
    vec3(0.5),
    false,
    xAxisRepeat
  );  

  res.color = zAxisRepeat < res.dist ? vec3(0.5) : res.color;
  res.dist = min(res.dist, zAxisRepeat);


  // AXES

  res.color = xAxis < res.dist ? vec3(1., 0., 0.) : res.color;
  res.dist = min(res.dist, xAxis);

  res.color = yAxis < res.dist ? vec3(0., 1., 0.) : res.color;
  res.dist = min(res.dist, yAxis);

  res.color = zAxis < res.dist ? vec3(0., 0., 1.) : res.color;
  res.dist = min(res.dist, zAxis);


  // SPHERES

  ${generateObjectsString()}

  return res;
}

vec3 GetNormal(vec3 p) {
  float EPS = 0.0001;
  vec3 n = vec3(
    map(p + vec3(EPS, 0., 0.)).dist - map(p - vec3(EPS, 0., 0.)).dist,
    map(p + vec3(0., EPS, 0.)).dist - map(p - vec3(0., EPS, 0.)).dist,
    map(p + vec3(0., 0., EPS)).dist - map(p - vec3(0., 0., EPS)).dist
  );

  return normalize(n);
}

vec3 GetLighting (vec3 pos, vec3 normal, vec3 lightColor, vec3 lightDir) {
  float dp = clamp(dot(normal, lightDir), 0., 1.);

  return lightColor * dp;
}

vec3 GetSpecular (vec3 pos, vec3 normal, vec3 lightColor, vec3 lightDir) {
  return vec3(pow(max(0., dot(normalize(reflect(lightDir, normal)), -pos)), 32.));
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
  vec3 ta = iLookAt;

  mat3 camera = setCamera(ta, ro);

  vec3 rd = normalize(camera * vec3(uv * 0.5, 1.0));

  vec3 col = vec3(0.);

  float t = 0.;
  MaterialDist m = MaterialDist(vec3(0.), false, 0.);
  vec3 p;

  for (int i = 0; i < 256; i++) {
    p = ro + rd * t;

    m = map(p);

    float d = m.dist;

    t += d;

    if (d < .001) break;

    if (t > 1000.) {
      m.color = vec3(1.);
      break;
    }

  }
  
  vec3 lightDir = normalize(vec3(1., 2., -1.));
  vec3 lightColor = vec3(1.);
  vec3 normal = GetNormal(p);
  vec3 lambertian = GetLighting(p, normal, lightColor, lightDir);
  vec3 spec = GetSpecular(-rd, normal, lightColor, lightDir);

  vec3 light = m.isLit ? lambertian + spec * .0 : vec3(1.);

  col = m.color * light;
  col = pow(col, vec3(1. / 2.2));
  col = mix(col, vec3(1.), t * 0.02);

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
  const uLookAtLocation = gl.getUniformLocation(program, 'iLookAt')

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

  const camera = new Camera(
    { x: 2, y: 2, z: -2 },
    { x: 0, y: 0, z: 0 }
  )
  camera.zoom(300)

  mouseMovementManager.addMoveCallback(deltaMove => {
    if (!keyboardMovementManager.getIsShiftPressed()) {
      camera.orbit(-deltaMove.x, -deltaMove.y)
    }

    if (keyboardMovementManager.getIsShiftPressed()) {
      camera.pan(-deltaMove.x, -deltaMove.y)
    }
  })

  mouseMovementManager.addWheelCallback(deltaWheel => {
    camera.zoom(deltaWheel)
  })

  const animate = () => {
    resizeCanvasToDisplaySize(canvas)
    gl.viewport(0, 0, canvas.width, canvas.height)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.uniform2f(uResolutionLocation, canvas.width, canvas.height)
    gl.uniform3f(uCameraOriginLocation, camera.getOrigin().x, camera.getOrigin().y, camera.getOrigin().z)
    gl.uniform3f(uLookAtLocation, camera.getTarget().x, camera.getTarget().y, camera.getTarget().z)

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    window.requestAnimationFrame(animate)
  }

  animate()
}

function generateObjectsString() {
  return scene.map((shape, index) => shape.getShaderString(index)).join('')
}

const keyboardMovementManager = new KeyboardMovementManager()
const mouseMovementManager = new MouseMovementManager()