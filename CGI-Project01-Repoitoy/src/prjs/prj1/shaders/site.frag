#version 300 es

precision highp float;

in vec3 v_color;    //Receives the color from the vertex shader
out vec4 color;

void main() {
    color = vec4(v_color, 1.0f);    //Applies the color given with full opacity
}