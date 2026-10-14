#version 300 es

precision highp float;

//Coordinates coming from the vertex shader
in vec2 v_position;

//Positions of all the sites(in world coordinates)
uniform vec2  u_sites[32];
//Color of all the sites
uniform vec3  u_colors[32];
//Number of existing sites
uniform int u_count;

//world offset (pan), in world units
uniform vec2  u_pan;
// scale factor (> 1 = zoomed in)
uniform float u_zoom;
// canvas width / height
uniform float u_aspect;

out vec4 color;

void main() {
    if(u_count == 0){
        color = vec4(0.2f, 0.4f, 0.6f, 1.0f);
        return;
    }

    vec2 world_pos = vec2(
        v_position.x * u_aspect / u_zoom - u_pan.x,
        v_position.y / u_zoom - u_pan.y);

    int closest_index = 0;
    vec2 diff = world_pos - u_sites[0];
    float min_dist_sq = dot(diff, diff);

    for(int i = 1; i < u_count; i++){
        diff = world_pos - u_sites[i];
        float dist_sq = dot(diff, diff);

        if(dist_sq < min_dist_sq){
            min_dist_sq = dist_sq;
            closest_index = i;
        }
    }

    color = vec4(u_colors[closest_index], 1.0);
}