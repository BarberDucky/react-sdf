import { createContext, createProgram, createShader } from './helpers.ts'
import { Uniform, Uniform1i, Uniform2f, Uniform3f, UniformBool, UniformTypeMap, UniformTypeValue } from './uniform.ts'

import defaultVertexShader from '../renderers/shaders/default.vertex.glsl?raw'
import sceneFragmentShader from '../renderers/shaders/scene.fragment.glsl?raw'
import maskFragmentShader from '../renderers/shaders/selected-mask.fragment.glsl?raw'
import highlightFragmentShader from '../renderers/shaders/selected-highlight.fragment.glsl?raw'

export class WebGlContext {

  private _gl: WebGL2RenderingContext

  public _sceneProgram: WebGLProgram
  public _maskProgram: WebGLProgram
  public _highlightProgram: WebGLProgram

  private _maxTextureCount = 4

  private _maskTexture: WebGLTexture
  private _maskFbo: WebGLFramebuffer

  private _uniforms: Map<WebGLProgram, Map<string, Uniform<unknown>>> = new Map()

  private _textures: Map<string, WebGLTexture> = new Map()

  constructor(
    private canvas: HTMLCanvasElement,
  ) {
    this._gl = createContext(canvas)

    const _defaultVertexShader = createShader(this._gl, this._gl.VERTEX_SHADER, defaultVertexShader)
    const _sceneFragmentShader = createShader(this._gl, this._gl.FRAGMENT_SHADER, sceneFragmentShader)
    const _maskFragmentShader = createShader(this._gl, this._gl.FRAGMENT_SHADER, maskFragmentShader)
    const _highlightFragmentShader = createShader(this._gl, this._gl.FRAGMENT_SHADER, highlightFragmentShader)

    this._sceneProgram = createProgram(this._gl, _defaultVertexShader, _sceneFragmentShader)
    this._maskProgram = createProgram(this._gl, _defaultVertexShader, _maskFragmentShader)
    this._highlightProgram = createProgram(this._gl, _defaultVertexShader, _highlightFragmentShader)

    this._gl.deleteShader(_defaultVertexShader)
    this._gl.deleteShader(_sceneFragmentShader)
    this._gl.deleteShader(_maskFragmentShader)

    this._maskTexture = this.createMaskTexture()
    this._maskFbo = this.createMaskFbo()

    this._textures.set('iMaskTexture', this._maskTexture)
    this.registerUniform('iMaskTexture', { type: '1i', value: 0 }, this._highlightProgram)

    this.initializeViewport()
  }

  private initializeViewport() {
    const scenePositionAttributeLocation = this._gl.getAttribLocation(this._sceneProgram, 'a_position')
    const maskPositionAttributeLocation = this._gl.getAttribLocation(this._maskProgram, 'a_position')
    const highlightPositionAttributeLocation = this._gl.getAttribLocation(this._highlightProgram, 'a_position')

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

    const size = 2
    const type = this._gl.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0

    this._gl.enableVertexAttribArray(scenePositionAttributeLocation)
    this._gl.vertexAttribPointer(scenePositionAttributeLocation, size, type, normalize, stride, offset)

    this._gl.enableVertexAttribArray(maskPositionAttributeLocation)
    this._gl.vertexAttribPointer(maskPositionAttributeLocation, size, type, normalize, stride, offset)

    this._gl.enableVertexAttribArray(highlightPositionAttributeLocation)
    this._gl.vertexAttribPointer(highlightPositionAttributeLocation, size, type, normalize, stride, offset)
  }

  public requestDraw() {
    this.drawScene()

    this.drawOutlineMask()

    this.drawOutline()
  }

  public drawScene() {
    const uniforms = this._uniforms.get(this._sceneProgram)

    this._gl.useProgram(this._sceneProgram)

    if (uniforms != null) {
      uniforms.forEach(uniform => uniform.accept(this._gl))

      const textures = [...this._textures]
      for (let i = 0; i < textures.length; i++) {
        const textureUniform = uniforms.get(textures[i][0]) as Uniform1i
        if (textureUniform == null) { continue }

        this._gl.activeTexture(this._gl.TEXTURE0 + i + 1)
        this._gl.bindTexture(this._gl.TEXTURE_2D, textures[i][1])
        textureUniform.value = i + 1
      }
    }

    this._gl.drawArrays(this._gl.TRIANGLES, 0, 6)
  }

  public drawOutlineMask() {
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._maskFbo)

    const status = this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER)
    if (status !== this._gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer incomplete:', status)
    }

    this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height)
    this._gl.clear(this._gl.COLOR_BUFFER_BIT)

    const uniforms = this._uniforms.get(this._maskProgram)

    this._gl.useProgram(this._maskProgram)

    if (uniforms != null) {
      uniforms.forEach(uniform => uniform.accept(this._gl))

      const textures = [...this._textures]
      for (let i = 0; i < textures.length; i++) {
        const textureUniform = uniforms.get(textures[i][0]) as Uniform1i
        if (textureUniform == null) { continue }

        this._gl.activeTexture(this._gl.TEXTURE0 + i + 1)
        this._gl.bindTexture(this._gl.TEXTURE_2D, textures[i][1])
        textureUniform.value = i + 1
      }
    }

    this._gl.drawArrays(this._gl.TRIANGLES, 0, 6)

    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null)
  }

  public drawOutline() {
    const uniforms = this._uniforms.get(this._highlightProgram)

    this._gl.useProgram(this._highlightProgram)

    if (uniforms != null) {
      uniforms.forEach(uniform => uniform.accept(this._gl))

      const textures = [...this._textures]
      for (let i = 0; i < textures.length; i++) {
        const textureUniform = uniforms.get(textures[i][0]) as Uniform1i
        if (textureUniform == null) { continue }

        this._gl.activeTexture(this._gl.TEXTURE0 + i + 1)
        this._gl.bindTexture(this._gl.TEXTURE_2D, textures[i][1])
        textureUniform.value = i + 1
      }
    }

    this._gl.drawArrays(this._gl.TRIANGLES, 0, 6)
  }

  private createMaskTexture() {
    const texture = this._gl.createTexture()

    if (texture == null) {
      throw new Error(`Mask texture not created.`)
    }

    this._gl.bindTexture(this._gl.TEXTURE_2D, texture)
    this._gl.texImage2D(
      this._gl.TEXTURE_2D,
      0,
      this._gl.RGBA8,
      1000,
      1000,
      0,
      this._gl.RGBA,
      this._gl.UNSIGNED_BYTE,
      null,
    )

    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.NEAREST)
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.NEAREST)
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE)
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE)

    return texture
  }

  private createMaskFbo() {
    const fbo = this._gl.createFramebuffer()

    if (fbo == null) {
      throw new Error(`Mask framebuffer not created.`)
    }

    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, fbo)


    this._gl.framebufferTexture2D(
      this._gl.FRAMEBUFFER,
      this._gl.COLOR_ATTACHMENT0,
      this._gl.TEXTURE_2D,
      this._maskTexture,
      0,
    )
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null)

    const status = this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER)
    if (status !== this._gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer incomplete:', status)
    }
    return fbo
  }

  public resizeViewport(width: number, height: number) {
    this._gl.viewport(0, 0, width, height)

    this._gl.bindTexture(this._gl.TEXTURE_2D, this._maskTexture)
    this._gl.texImage2D(
      this._gl.TEXTURE_2D,
      0,
      this._gl.RGBA8,
      width,
      height,
      0,
      this._gl.RGBA,
      this._gl.UNSIGNED_BYTE,
      null,
    )
  }

  public registerUniform<T extends UniformTypeValue>(
    name: string,
    typeValue: T,
    program: WebGLProgram,
  ): UniformTypeMap[T['type']]['instance'] {

    const location = this._gl.getUniformLocation(program, name)
    const tv: UniformTypeValue = typeValue

    let uniform: UniformTypeMap[T['type']]['instance']
    switch (tv.type) {
      case '1i':
        uniform = new Uniform1i(location!, tv.value) as Uniform1i
        break
      case '2f':
        uniform = new Uniform2f(location!, tv.value) as Uniform2f
        break
      case '3f':
        uniform = new Uniform3f(location!, tv.value) as Uniform3f
        break
      case 'bool':
        uniform = new UniformBool(location!, tv.value) as UniformBool
        break
      default: {
        throw new Error(`Unknown uniform type: ${tv}`)
      }
    }

    if (!this._uniforms.has(program)) {
      this._uniforms.set(program, new Map())
    }
    this._uniforms.get(program)!.set(name, uniform)

    return uniform
  }

  public createDataTexture(name: string) {
    const newTexture = this._gl.createTexture()

    if (newTexture == null) {
      this._gl.deleteTexture(newTexture)
      throw new Error(`Error while creating texture. Likely, the WebGL context is lost.`)
    }

    this.registerUniform(name, { type: '1i', value: 0 }, this._sceneProgram)
    this.registerUniform(name, { type: '1i', value: 0 }, this._maskProgram)

    this._textures.set(name, newTexture)
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

}