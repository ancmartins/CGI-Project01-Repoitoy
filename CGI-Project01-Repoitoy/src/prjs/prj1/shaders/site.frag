#version 300 es

precision highp float;

out vec4 color;

void main() {
    //Calculates the distance of this pixel to the center point(0.5, 0.5)
    vec2 coord = gl_PointCoord - vec2(0.5);

    //If distance greater that radius, then discard it
    if(length(coord) > 0.5){
        discard;
    }
    color = vec4(0.0, 0.0, 0.0, 1.0f);    //Applies the color given with full opacity
}