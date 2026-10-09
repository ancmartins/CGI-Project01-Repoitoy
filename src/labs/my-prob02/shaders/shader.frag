#version 300 es

precision mediump float;

out vec4 color;

void main() {
    color = vec4(1.0f, 0.0f, 0.0f, 1.0f);
    float d = distance(gl_PointCoord, vec2(0.2,.5));
    if(d > 0.5){
        discard;
    }
}