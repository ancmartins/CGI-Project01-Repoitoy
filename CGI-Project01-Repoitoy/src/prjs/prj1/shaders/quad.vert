#version 300 es

// The corners of the quad are already in clip space, so they pass straight
// through.

in vec2 a_position;

//Gives the position of the pixel to the fragment shader
out vec2 v_position;

void main() {
    gl_Position = vec4(a_position, 0.0f, 1.0f);
    v_position = a_position;
}
