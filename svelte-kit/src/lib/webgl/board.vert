#version 300 es

precision mediump float;

in vec4 aPosition;
in vec3 aColor;

out vec3 vColor;

void main() {
  vColor = aColor;
  gl_Position = aPosition;
}
