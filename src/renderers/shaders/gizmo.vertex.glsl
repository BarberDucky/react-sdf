#version 300 es
in vec3 a_position;
in vec4 a_color;

uniform mat4 iGizmoTransform;

out vec4 v_color;

void main() {
  v_color = a_color;
  gl_Position = iGizmoTransform * vec4(a_position, 1.0);;
}