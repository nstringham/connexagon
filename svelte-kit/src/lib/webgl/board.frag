#version 300 es

precision mediump float;

in vec3 vColor;
out vec4 fColor;

void main(void) {
  fColor = vec4(vColor, 1);
}
