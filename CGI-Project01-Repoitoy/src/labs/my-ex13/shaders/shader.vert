#version 300 es

in vec2 a_position;
in vec3 a_color;

// SAÍDA: Deve ser do tipo 'vec3'
out vec3 v_color;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_color = a_color;
}