import { Operation } from "../model/shape-tree"
import { dedent } from "../utils"
import { SdfShapeVisitor } from "./sdf-shape-visitor"

export class SdfRenderer {

  private visitor = new SdfShapeVisitor()

  generateVertexShaderString() {
    return dedent`#version 300 es
      in vec4 a_position;

      void main() {
        gl_Position = a_position;
      }`
  }

  generateFragmentShaderString(root: Operation) {
    return dedent`#version 300 es
      precision highp float;

      out vec4 outColor;

      uniform vec2 iResolution;
      uniform vec3 iCameraOrigin;
      uniform vec3 iLookAt;
      uniform bool iIsGizmoEnabled;

      uniform int iShapeCount;

      uniform sampler2D iSampler1;
      uniform sampler2D iSampler2;
      uniform sampler2D iSampler3;
      uniform sampler2D iSampler4;

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

      float opUnion( float d1, float d2 )
      {
          return min(d1,d2);
      }

      float opSmoothUnion( float d1, float d2, float k )
      {
          float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
          return mix( d2, d1, h ) - k*h*(1.0-h);
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

      float sdBox( vec3 p, vec3 b )
      {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float intersect(vec3 p) {

        float mainAxisWidth = .005;
        float gridAxisWidth = .001;

        vec3 xPos = p;
        vec3 yPos = p;
        vec3 zPos = p;
        
        xPos.yz *= rot2D(3.14 / 2.);
        zPos.xy *= rot2D(3.14 / 2.);

        float xAxis = sdCylinder(xPos + mainAxisWidth, vec3(mainAxisWidth));
        float yAxis = sdCylinder(yPos + mainAxisWidth, vec3(mainAxisWidth));
        float zAxis = sdCylinder(zPos + mainAxisWidth, vec3(mainAxisWidth));

        float xAxisRepeat = opLineRepetition(xPos, vec3(.25, 0., 0.), vec3(gridAxisWidth));
        float zAxisRepeat = opLineRepetition(zPos, vec3(0., 0., .25), vec3(gridAxisWidth));

        float res = xAxisRepeat;

        res = opUnion(res, zAxisRepeat);

        // AXES

        if (iIsGizmoEnabled) {
          res = opUnion(res, xAxis);
          res = opUnion(res, yAxis);
          res = opUnion(res, zAxis);
        }

        // SHAPES

        int sp = 0;
        float stack[12];

        int texelWidth = 3;

        for (int i = 0; i < iShapeCount; i++) {
          vec4 typeExtra = texelFetch(iSampler1, ivec2(0 + i * texelWidth, 0), 0);
          vec3 position = texelFetch(iSampler1, ivec2(1 + i * texelWidth, 0), 0).xyz;

          if (typeExtra.x < 0.5) {

            float m = sdSphere(p - position, typeExtra.y);
            stack[sp++] = m;

          } else if (typeExtra.x < 1.5) {
            
            float m = sdBox(p - position, typeExtra.yzw);
            stack[sp++] = m;

          } else if (typeExtra.x < 2.5) {

            float m1 = stack[--sp]; 
            float m2 = stack[--sp];

            float g = 1000.;

            g = opUnion(g, m1);
            g = opUnion(g, m2); 
            stack[sp++] = g;

          } else if (typeExtra.x < 3.5) {
            // draw smooth union
          }
        
        }

        float f = stack[0];
        res = opUnion(res, f);

        return res;
      }

      MaterialDist shade(vec3 p) {

        float mainAxisWidth = .005;
        float gridAxisWidth = .001;

        vec3 xPos = p;
        vec3 yPos = p;
        vec3 zPos = p;
        
        xPos.yz *= rot2D(3.14 / 2.);
        zPos.xy *= rot2D(3.14 / 2.);

        float xAxis = sdCylinder(xPos + mainAxisWidth, vec3(mainAxisWidth));
        float yAxis = sdCylinder(yPos + mainAxisWidth, vec3(mainAxisWidth));
        float zAxis = sdCylinder(zPos + mainAxisWidth, vec3(mainAxisWidth));

        float xAxisRepeat = opLineRepetition(xPos, vec3(.25, 0., 0.), vec3(gridAxisWidth));
        float zAxisRepeat = opLineRepetition(zPos, vec3(0., 0., .25), vec3(gridAxisWidth));

        MaterialDist res = MaterialDist(
          vec3(0.8),
          false,
          xAxisRepeat
        );  

        res.color = zAxisRepeat < res.dist ? vec3(0.8) : res.color;
        res.dist = opUnion(res.dist, zAxisRepeat);

        // AXES

        if (iIsGizmoEnabled) {
          res.color = xAxis < res.dist ? vec3(1., 0., 0.) : res.color;
          res.dist = opUnion(res.dist, xAxis);

          res.color = yAxis < res.dist ? vec3(0., 1., 0.) : res.color;
          res.dist = opUnion(res.dist, yAxis);

          res.color = zAxis < res.dist ? vec3(0., 0., 1.) : res.color;
          res.dist = opUnion(res.dist, zAxis);
        }

        // SHAPES

        int sp = 0;
        MaterialDist stack[12];

        int texelWidth = 3;

        for (int i = 0; i < iShapeCount; i++) {
          vec4 typeExtra = texelFetch(iSampler1, ivec2(0 + i * texelWidth, 0), 0);
          vec3 position = texelFetch(iSampler1, ivec2(1 + i * texelWidth, 0), 0).xyz;
          vec3 color = texelFetch(iSampler1, ivec2(2 + i * texelWidth, 0), 0).rgb;

          if (typeExtra.x < 0.5) {

            MaterialDist m = MaterialDist(
              color,
              true,
              sdSphere(p - position, typeExtra.y)
            );

            stack[sp++] = m;

          } else if (typeExtra.x < 1.5) {
            
            MaterialDist m = MaterialDist(
              color,
              true,
              sdBox(p - position, typeExtra.yzw)
            );

            stack[sp++] = m;

          } else if (typeExtra.x < 2.5) {
            
            // if (sp < 2) { break; }


            MaterialDist m1 = stack[--sp]; 
            MaterialDist m2 = stack[--sp];

            MaterialDist g = MaterialDist(
              vec3(1.),
              true,
              1000.
            ); 

            g.color = m1.dist < g.dist ? m1.color : g.color;
            g.isLit = m1.dist < g.dist ? m1.isLit : g.isLit;
            g.dist = opUnion(g.dist, m1.dist);

            g.color = m2.dist < g.dist ? m2.color : g.color;
            g.isLit = m2.dist < g.dist ? m2.isLit : g.isLit;
            g.dist = opUnion(g.dist, m2.dist); 

            stack[sp++] = g;
          } else if (typeExtra.x < 3.5) {
            // draw smooth union
          }
        
        }

        MaterialDist f = stack[0];
        res.color = f.dist < res.dist ? f.color : res.color;
        res.isLit = f.dist < res.dist ? f.isLit : res.isLit;
        res.dist = opUnion(res.dist, f.dist);

        return res;
      }

      vec3 GetNormal(vec3 p) {
        float EPS = 0.0001;
        vec3 n = vec3(
          intersect(p + vec3(EPS, 0., 0.)) - intersect(p - vec3(EPS, 0., 0.)),
          intersect(p + vec3(0., EPS, 0.)) - intersect(p - vec3(0., EPS, 0.)),
          intersect(p + vec3(0., 0., EPS)) - intersect(p - vec3(0., 0., EPS))
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

      vec3 render (vec2 uv) {
        vec3 ro = iCameraOrigin;
        vec3 ta = iLookAt;

        mat3 camera = setCamera(ta, ro);

        vec3 rd = normalize(camera * vec3(uv * 0.5, 1.0));

        vec3 col = vec3(0.);

        float t = 0.;
        MaterialDist m = MaterialDist(vec3(0.), false, 0.);
        float inter = 0.;
        vec3 p;
        int isWhite = 0;

        for (int i = 0; i < 256; i++) {
          p = ro + rd * t;

          float d = intersect(p);

          t += d;

          if (d < .001) break;

          if (t > 1000.) {
            isWhite = 1;
            break;
          }

        }
        
        m = shade(p);

        vec3 lightDir = normalize(vec3(1., 2., -1.));
        vec3 lightColor = vec3(1.);
        vec3 normal = GetNormal(p);
        vec3 lambertian = GetLighting(p, normal, lightColor, lightDir);
        vec3 spec = GetSpecular(-rd, normal, lightColor, lightDir);

        vec3 light = m.isLit ? lambertian + spec * .0 : vec3(1.);

        col = (isWhite == 0 ? m.color : vec3(1.)) * light;
        col = pow(col, vec3(1. / 2.2));
        col = mix(col, vec3(1.), t * 0.02);

        return col;
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

        col = render(uv);

        outColor = vec4(col, 1.);
      }`
  }

}