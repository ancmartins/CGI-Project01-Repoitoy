#version 300 es
precision highp float;

// Sites Uniforms (passed as arrays)
const int MAX_SITES = 32;
uniform vec2 u_sites[MAX_SITES];
uniform vec3 u_colors[MAX_SITES];

// Camera and metric Uniform
uniform vec2 u_pan;
uniform float u_zoom;
uniform float u_aspect;
uniform int u_metric; // 1: Euclidiana, 2: Manhattan, 3: Chebyshev

const float R_MAX = 1000.0;
const float PI = 3.14159265359;

out vec3 v_color;

// Function that calculates the position of the outer bourder
// Função que calcula a posição na borda exterior (z = R)
vec3 getRimVertex(int index, int total_sides) {
    if (u_metric == 3) { 
        // Chebyshev: Gives a square with the parallel to the X and Y axi  
        //  _______
        // |       |
        // |       |
        // |_______|
        int i = index % 4;
        if (i == 0) return vec3( R_MAX,  R_MAX, R_MAX);
        if (i == 1) return vec3(-R_MAX,  R_MAX, R_MAX);
        if (i == 2) return vec3(-R_MAX, -R_MAX, R_MAX);
        return vec3( R_MAX, -R_MAX, R_MAX);
    } 
    else if (u_metric == 2) { 
        // Manhattan: Gives a pyramid with the points in the X and Y axis
        // - - - -
        // |  /\ |
        // |/   \|
        // |\   /|
        // | \/  |
        // - - - -
        int i = index % 4;
        if (i == 0) return vec3( R_MAX,    0.0, R_MAX);
        if (i == 1) return vec3(   0.0,  R_MAX, R_MAX);
        if (i == 2) return vec3(-R_MAX,    0.0, R_MAX);
        return vec3(   0.0, -R_MAX, R_MAX);
    } 
    else { 
        // Euclidiana (): Circle with diameter R
        float angle = 2.0 * PI * float(index) / float(total_sides);
        return vec3(R_MAX * cos(angle), R_MAX * sin(angle), R_MAX);
    }
}

void main() {

    // 1. Discovers the cureent site through the gl_InstaceID 
    int site_idx = gl_InstanceID;
    vec2 site_pos = u_sites[site_idx];
    v_color = u_colors[site_idx];

    //Number of sides on the piramid/cone
    int sides = (u_metric == 1) ? 64 : 4;

    // 2. Discover which face and which vertice of that face through the gl_VertexID 
    int side_idx = gl_VertexID / 3;
    int vert_in_tri = gl_VertexID % 3;

    vec3 local_pos;

    if (vert_in_tri == 0) {
        // Vértex 0: Point on the top (Z = 0)
        local_pos = vec3(0.0, 0.0, 0.0);
    } else if (vert_in_tri == 1) {
        // Vértex 1: First point of the base (Z = R_MAX)
        local_pos = getRimVertex(side_idx, sides);
    } else {
        // Vértex 2: Second point of the base (Z = R_MAX)
        local_pos = getRimVertex(side_idx + 1, sides);
    }

    // 3. Positioning of the world and view transformation
    vec2 world_pos = local_pos.xy + site_pos;

    float clip_x = (world_pos.x + u_pan.x) * u_zoom / u_aspect;
    float clip_y = (world_pos.y + u_pan.y) * u_zoom;
    float clip_z = (local_pos.z / R_MAX) * 2.0 - 1.0;

    gl_Position = vec4(clip_x, clip_y, clip_z, 1.0);
}