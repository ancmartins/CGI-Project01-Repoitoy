#version 300 es
precision mediump float;

// ENTRADA: Deve corresponder EXATAMENTE ao tipo 'vec3' do vertex shader
in vec3 v_color;

layout(location = 0) out vec4 fragColor;

void main() {
    fragColor = vec4(v_color, 1.0);
}