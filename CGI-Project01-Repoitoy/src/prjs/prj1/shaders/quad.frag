#version 300 es

precision highp float;

//Coordinates coming from the vertex shader in Clip Space (-1, 1)
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
    //1. Base case: there is no sites created
    if(u_count == 0){
        color = vec4(0.2f, 0.4f, 0.6f, 1.0f);
        return;
    }

    //2. Converts the Clip Space coordinates into world space
    vec2 world_pos = vec2(
        v_position.x * u_aspect / u_zoom - u_pan.x,
        v_position.y / u_zoom - u_pan.y);

    //3. Defines the first site as the closest 
    int closest_index = 0;
    vec2 diff = world_pos - u_sites[0];     //Displacement vector (dx, dy) of the pixel to the first site
    float min_dist = sqrt(diff.x * diff.x + diff.y * diff.y);    //Calculates the Euclidean distance of the two points

    //4. Loops over all sites to find the closest
    for(int i = 1; i < u_count; i++){
        diff = world_pos - u_sites[i];
        float dist = sqrt(diff.x * diff.x + diff.y * diff.y);

        //4.1. If the current distance is less than the stored one, changes the stored to the current 
        if(dist < min_dist){
            min_dist = dist;
            closest_index = i;
        }
    }

    //5. Defines the final color of the pixel
    color = vec4(u_colors[closest_index], 1.0);
}