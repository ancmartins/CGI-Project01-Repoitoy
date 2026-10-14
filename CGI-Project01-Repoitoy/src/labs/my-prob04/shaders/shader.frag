#version 300 es

precision mediump float;

out vec4 color;

void main() {
    float pattern = mod(floor(gl_FragCoord.x / 50.0) + floor(gl_FragCoord.y / 50.0), 2.0);
    color = vec4(vec3(pattern), 1.0);
}