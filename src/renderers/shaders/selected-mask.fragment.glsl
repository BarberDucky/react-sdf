#version 300 es
precision highp float;

out vec4 outColor;

uniform vec2 iResolution;
uniform vec3 iCameraOrigin;
uniform vec3 iLookAt;
uniform bool iIsGizmoEnabled;
uniform int iTexelCount;

uniform int iShapeCount;

uniform sampler2D iShapeDataTexture;

struct MaterialDist {
  float color;
  float dist;
};

vec3 rot3D(vec3 p, vec3 axis, float angle) {
  return mix(dot(axis, p) * axis, p, cos(angle)) + cross(axis, p) * sin(angle);
}

mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

mat3 rotateXYZ(vec3 a) {
  float sx = sin(a.x), cx = cos(a.x);
  float sy = sin(a.y), cy = cos(a.y);
  float sz = sin(a.z), cz = cos(a.z);

  mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, cx, -sx, 0.0, sx, cx);
  mat3 ry = mat3(cy, 0.0, sy, 0.0, 1.0, 0.0, -sy, 0.0, cy);
  mat3 rz = mat3(cz, -sz, 0.0, sz, cz, 0.0, 0.0, 0.0, 1.0);

  return rz * ry * rx; // apply X, then Y, then Z
}

float opUnion(float d1, float d2) {
  return min(d1, d2);
}

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

float opSmoothSubtraction(float a, float b, float k) {
  return -opSmoothUnion(a, -b, k);
}

float opSmoothIntersection(float a, float b, float k) {
  return -opSmoothUnion(-a, -b, k);
}

float sdCylinder(vec3 p, vec3 c) {
  return length(p.xz - c.xy) - c.z;
}

float opLineRepetition(in vec3 p, in vec3 s, vec3 c) {
  vec3 q = p - s * round(p / s);
  return sdCylinder(q, c);
}

float sdSphere(vec3 p, float s) {
  return length(p) - s;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float doOperation(vec2 opData, float d1, float d2) {
  if (opData.x < 0.5) {
    return opSmoothUnion(d1, d2, opData.y);
  } else if (opData.x < 1.5) {
    return opSmoothSubtraction(d1, d2, opData.y);
  } else if (opData.x < 2.5) {
    return opSmoothIntersection(d1, d2, opData.y);
  }
}

float opRound(in float d, in float rad) {
  return d - rad;
}

MaterialDist shadeMaskList(vec3 p) {

  MaterialDist res = MaterialDist(0., 1000.);

  // SHAPES

  MaterialDist shapesMat = MaterialDist(1., 1000.);
  MaterialDist m;

  for (int i = 0; i < iShapeCount; i++) {
    vec4 typeExtra = texelFetch(iShapeDataTexture, ivec2(0 + i * iTexelCount, 0), 0);
    vec3 position = texelFetch(iShapeDataTexture, ivec2(1 + i * iTexelCount, 0), 0).xyz;
    float isSelected = texelFetch(iShapeDataTexture, ivec2(2 + i * iTexelCount, 0), 0).w;
    vec4 rotationScale = texelFetch(iShapeDataTexture, ivec2(3 + i * iTexelCount, 0), 0).xyzw;
    vec3 operationRound = texelFetch(iShapeDataTexture, ivec2(4 + i * iTexelCount, 0), 0).xyz;

    if (typeExtra.x < 0.5) {

      // skip group

    } else if (typeExtra.x < 1.5 && isSelected > 0.5) {
      vec3 rotP = rotateXYZ(- vec3(rotationScale.x, rotationScale.y, rotationScale.z)) * (p - position);

      m = MaterialDist(
      isSelected,
      sdSphere(rotP / rotationScale.w, typeExtra.y - typeExtra.y * operationRound.z / 100.) * rotationScale.w
      );
      m.dist = opRound(m.dist, typeExtra.y * operationRound.z / 100. * rotationScale.w);

      shapesMat.color = m.dist < shapesMat.dist ? m.color : shapesMat.color;
      shapesMat.dist = doOperation(vec2(operationRound.x, 0.), shapesMat.dist, m.dist);

    } else if (typeExtra.x < 2.5 && isSelected > 0.5) {
      float minDim = min(min(typeExtra.y, typeExtra.z), typeExtra.w);
      vec3 rotP = rotateXYZ(- vec3(rotationScale.x, rotationScale.y, rotationScale.z)) * (p - position);

      MaterialDist m = MaterialDist(
      isSelected,
      sdBox(rotP / rotationScale.w, typeExtra.yzw - vec3(minDim * operationRound.z / 100.)) * rotationScale.w
      );
      m.dist = opRound(m.dist, minDim * operationRound.z / 100. * rotationScale.w);

      shapesMat.color = m.dist < shapesMat.dist ? m.color : shapesMat.color;
      shapesMat.dist = doOperation(vec2(operationRound.x, 0.), shapesMat.dist, m.dist);

    }
  }

  res.color = shapesMat.dist < res.dist ? shapesMat.color : res.color;
  res.dist = opUnion(res.dist, shapesMat.dist);

  return res;
}

mat3 setCamera(vec3 target, vec3 position) {
  vec3 z = normalize(target - position);
  vec3 x = normalize(cross(z, vec3(0.0, 1.0, 0.0)));
  vec3 y = normalize(cross(x, z));
  return mat3(x, y, z);
}

float render(vec2 uv) {
  vec3 ro = iCameraOrigin;
  vec3 ta = iLookAt;

  mat3 camera = setCamera(ta, ro);

  vec3 rd = normalize(camera * vec3(uv * 0.5, 1.0));

  vec3 col = vec3(0.);

  float t = 0.;
  float m = 0.;
  vec3 p;

  for (int i = 0; i < 256; i++) {
    p = ro + rd * t;

    float d = shadeMaskList(p).dist;

    t += d;

    if (d < .001) break;

    if (t > 1000.) {
      return 0.;
      break;
    }

  }

  return shadeMaskList(p).color;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2. - iResolution.xy) / iResolution.y;

  vec3 col = vec3(0.);

  // for(int y = 0; y < 2; y++) {
  // for(int x = 0; x < 2; x++) {
  //     vec2 off = vec2(float(x),float(y))/2.;
  //     vec2 xy = (-iResolution.xy+2.0*(gl_FragCoord.xy+off)) / iResolution.y;
  // 	  col += render(xy)*0.25;
  //   }
  // }

  col = vec3(render(uv));

  outColor = vec4(col, 1.);
}