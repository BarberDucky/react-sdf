import { Shape, Sphere } from "../model/shapes"
import { dedent, floatToGlslFloat, point3ToVec3 } from "../utils"

export class SdfRenderer {

  getShaderString(shape: Shape, id: number): string {
    if (shape instanceof Sphere) {
      return this.getSphereShaderString(shape, id)
    } else {
      console.warn(`Shape type ${typeof shape} not defined for SDF renderer.`)
      return ''
    }
  }

  getSphereShaderString(sphere: Sphere, id: number) {
    return dedent`
      float sphere${id} = sdSphere(p - ${point3ToVec3(sphere.position)}, ${floatToGlslFloat(sphere.radius)});
      res.color = sphere${id} < res.dist ? ${point3ToVec3(sphere.color)} : res.color;
      res.isLit = sphere${id} < res.dist ? true : res.isLit;
      res.dist = min(res.dist, sphere${id});`
  }

  generateVertexShaderString() {
    return dedent`#version 300 es
      in vec4 a_position;

      void main() {
        gl_Position = a_position;
      }`
  }

  generateFragmentShaderString(shapes: Array<Shape>) {
    const objectsString = shapes
      .map((shape, index) => this.getShaderString(shape, index)).join('')

    return dedent`#version 300 es
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
        res.dist = min(res.dist, zAxisRepeat);


        // AXES

        res.color = xAxis < res.dist ? vec3(1., 0., 0.) : res.color;
        res.dist = min(res.dist, xAxis);

        res.color = yAxis < res.dist ? vec3(0., 1., 0.) : res.color;
        res.dist = min(res.dist, yAxis);

        res.color = zAxis < res.dist ? vec3(0., 0., 1.) : res.color;
        res.dist = min(res.dist, zAxis);


        // SPHERES

        ${objectsString}

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

      vec3 render (vec2 uv) {
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

        return col;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2. - iResolution.xy) / iResolution.y;

        vec3 col = vec3(0.);

        for(int y = 0; y < 2; y++) {
        for(int x = 0; x < 2; x++) {
            vec2 off = vec2(float(x),float(y))/2.;
            vec2 xy = (-iResolution.xy+2.0*(gl_FragCoord.xy+off)) / iResolution.y;
        	  col += render(xy)*0.25;
          }
        }

        // col = render(uv);

        outColor = vec4(col, 1.);
      }`
  }

}