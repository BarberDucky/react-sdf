#version 300 es
precision highp float;

uniform sampler2D iMaskTexture;

uniform vec2 iResolution;

out vec4 outColor;

void main() {
  vec2 uv = (gl_FragCoord.xy) / iResolution.xy;
  float center = texture(iMaskTexture, uv).r;

  vec2 uTexelSize = 1.0 / iResolution * 3.;

  float maxNeighbor = 0.0;

  maxNeighbor = max(maxNeighbor, texture(iMaskTexture, uv + vec2(uTexelSize.x, 0)).r);
  maxNeighbor = max(maxNeighbor, texture(iMaskTexture, uv - vec2(uTexelSize.x, 0)).r);
  maxNeighbor = max(maxNeighbor, texture(iMaskTexture, uv + vec2(0, uTexelSize.y)).r);
  maxNeighbor = max(maxNeighbor, texture(iMaskTexture, uv - vec2(0, uTexelSize.y)).r);

  outColor = center < 0.5 && maxNeighbor > 0.5 ? vec4(1.0, 0.6, 0.0, 1.0) : vec4(0.0);
}