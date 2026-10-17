#version 300 es

precision highp float;

//Coordinates coming from the vertex shader in Clip Space (-1, 1)
in vec2 v_position;

const float BORDER_WIDTH = 0.01;

//Positions of all the sites(in world coordinates)
uniform vec2  u_sites[32];
//Color of all the sites
uniform vec3  u_colors[32];
//Number of existing sites
uniform int u_count;

uniform int u_show_borders;

//State that defines the metric used
//1 is Ecludian, 2 is Manhattan and 3 is Chebyshev
uniform int u_metric_state;

//world offset (pan), in world units
uniform vec2  u_pan;
// scale factor (> 1 = zoomed in)
uniform float u_zoom;
// canvas width / height
uniform float u_aspect;

out vec4 color;

float calculate_distance(vec2 diff){
    if(u_metric_state == 2){    //Manhattan Distance, sum of the absolute of the distance in the x axis and y axis
        return abs(diff.x) + abs(diff.y);
    }
    else if(u_metric_state == 3){   //Chebyshev Distance, max of the absolute value of the distance in the x axis and y axis
       return max(abs(diff.x), abs(diff.y));
    }
    return sqrt(diff.x * diff.x + diff.y * diff.y);     //Ecludian Distance, square root of the sum of the squared
}

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
    int second_closest_index = 0;
    vec2 diff = world_pos - u_sites[0];
    float d1 = calculate_distance(diff);
    float d2 = 1e5;

// 4. Loops over all sites to find the true d1 and d2
    for (int i = 1; i < u_count; i++) {
        diff = world_pos - u_sites[i];
        float dist = calculate_distance(diff);

        if (dist < d1) {
            d2 = d1;
            second_closest_index = closest_index; // Recuperado para saber o 2.º ponto
            
            d1 = dist;
            closest_index = i;
        } else if (dist < d2){  //Is the second greatest weakness
            d2 = dist;
            second_closest_index = i; // Recuperado
        }
    }

if (u_show_borders == 1 && u_count > 1) {
        float eps = BORDER_WIDTH / u_zoom;
        
        // Compensação geométrica para a Euclidiana (evita o alargamento em triângulo)
        vec2 s1 = u_sites[closest_index];
        vec2 s2 = u_sites[second_closest_index];
        float D = calculate_distance(s1 - s2);
            
         // Fórmula correta: multiplica por D e DIVIDE por (d1 + d2)
        eps = (eps * D) / (d1 + d2 + 0.0001); 
        
        float diff_d = abs(d1 - d2);
        
        // diff_d < eps: desenha a borda
        // diff_d > 0.0001: ignora os empates perfeitos que causam manchas em Manhattan/Chebyshev
        if (diff_d < eps) {
            color = vec4(1.0, 1.0, 1.0, 1.0); 
            return;
        }
    }
        //5. Defines the final color of the pixel
        color = vec4(u_colors[closest_index], 1.0);
}