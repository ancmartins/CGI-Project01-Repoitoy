#version 300 es

precision mediump float;

out vec4 color;
in vec4 vcolor;

void main() {
    color = vcolor;
}