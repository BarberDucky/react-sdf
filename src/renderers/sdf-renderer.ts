import defaultVertexShader from './shaders/default.vertex.glsl?raw'
import sceneFragmentShader from './shaders/scene.fragment.glsl?raw'

export class SdfRenderer {

  generateVertexShaderString() {
    return defaultVertexShader
  }

  generateFragmentShaderString() {
    return sceneFragmentShader
  }

}