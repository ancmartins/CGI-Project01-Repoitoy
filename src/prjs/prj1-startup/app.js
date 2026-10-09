import { loadShadersFromURLS, buildProgramFromSources, setupWebGL } from "../../libs/utils.js";

/** @type {HTMLCanvasElement} */
let canvas;
/** @type {WebGL2RenderingContext} */
let gl;

let program1;
let program2;
let quad_vao, sites_vao;       // the quad covering the whole viewport
let sites_buffer;
let color_buffer;

const MAX_SITES = 32;   // Limit of sites as mencioned in the statement
let sites = [    //Array to store all sites with their position and their colors
    { position: [0.0, 0.0], color: [1.0, 0.0, 0.0] }
]; 
let pan = { x: 0.0, y: 0.0 };   //Movement of canvas
let zoom = 1.0;         //Zoom of the canvas

//Variables of mouse control
let is_down = false;    //Indica se o botão está a ser premido
let dragged_site_index = -1;    //Stores the index of the clicked point, -1 means no point
let last_mouse_pixel = { x: 0, y: 0 };  //Stores the position of the starting click


// ---------------------------------------------------------------------------
// Input. The event listeners are already set up in setup_input(); fill in
// these functions. Mouse positions are in canvas pixels, with (0, 0) at the
// top-left corner and y growing downwards.
// ---------------------------------------------------------------------------

function on_mouse_down(x, y) {
    const [wx, wy] = screen_to_world(x, y);

    
}

function on_mouse_move(x, y) {
}

function on_mouse_up(x, y) {
}

// dy > 0 when the wheel is scrolled down (towards the user)
function on_wheel(x, y, dy) {
}

function on_key(key) {
    switch (key) {
        case '1':       // Euclidean distance
            break;
        case '2':       // Manhattan distance
            break;
        case '3':       // Chebyshev distance
            break;
        case 'b':       // toggle cell borders
            break;
        case 'x':       // remove the site under the pointer
            break;
        case 'm':       // switch rendering technique / split view
            break;
    }
}

//Returns a random color to give a new site
function get_random_color() {
  return [Math.random(), Math.random(), Math.random()];
}

//Converts the pixels of the event into coordinates usable by WebGL
function screen_to_world(px, py) {
  const aspect = canvas.width / canvas.height;
  
  // 1. Converts from pixels into coordinates
  const ndc_x = (2.0 * px / canvas.width) - 1.0;
  const ndc_y = 1.0 - (2.0 * py / canvas.height);

  // 2. Aplies the zoom, aspect ratio and pan into the coordinates
  const world_x = (ndc_x * aspect) / zoom - pan.x;
  const world_y = ndc_y / zoom - pan.y;

  return [world_x, world_y];
}
// ---------------------------------------------------------------------------

function resize() {
    // Match the canvas's drawing buffer to the size it is shown at, and
    // draw over all of it
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function setup_input() {
    canvas.addEventListener("mousedown", (event) => on_mouse_down(event.offsetX, event.offsetY));
    canvas.addEventListener("mousemove", (event) => on_mouse_move(event.offsetX, event.offsetY));
    window.addEventListener("mouseup", (event) => on_mouse_up(event.offsetX, event.offsetY));
    canvas.addEventListener("wheel", (event) => {
        on_wheel(event.offsetX, event.offsetY, event.deltaY);
        event.preventDefault();     // don't let the page scroll as well
    });
    window.addEventListener("keydown", (event) => on_key(event.key));
}

function setup(shaders) {
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas);

    program1 = buildProgramFromSources(gl, shaders["quad.vert"], shaders["quad.frag"]);
    program2 = buildProgramFromSources(gl, shaders["site.vert"], shaders["site.frag"]);

    // A quad covering the whole viewport, as two triangles: its corners are
    // the corners of clip space, from (-1, -1) to (1, 1)
    const corners = new Float32Array([
        -1, -1,     1, -1,     1, 1,       // first triangle
        -1, -1,     1, 1,     -1, 1,       // second triangle
    ]);

    quad_vao = gl.createVertexArray();
    gl.bindVertexArray(quad_vao);

    const quad_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);

    const a_position = gl.getAttribLocation(program1, "a_position");
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);



    sites_vao = gl.createVertexArray();
    gl.bindVertexArray(sites_vao);

    sites_buffer = gl.createBuffer(); // Guardar em variável global/módulo para reutilizar no animate()
    gl.bindBuffer(gl.ARRAY_BUFFER, sites_buffer);

    const positions = new Float32Array(sites.flatMap(s => s.position));
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

    const b_position = gl.getAttribLocation(program2, "a_position");
    gl.enableVertexAttribArray(b_position);
    gl.vertexAttribPointer(b_position, 2, gl.FLOAT, false, 0, 0); // 2 componentes: x e y

    const b_color = gl.getAttribLocation(program2, "a_color");
    color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);

    const colors = new Float32Array(sites.flatMap(s => s.color));
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);

    gl.enableVertexAttribArray(b_color);
    gl.vertexAttribPointer(b_color, 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);   

    resize();
    window.addEventListener("resize", resize);
    setup_input();
    

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    window.requestAnimationFrame(animate);
}

function animate(timestamp) {
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(quad_vao);
    gl.useProgram(program1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.useProgram(program2);
    gl.bindVertexArray(sites_vao);
    gl.drawArrays(gl.POINTS, 0, sites.length);
    
    gl.bindVertexArray(null);
    gl.useProgram(null);
}

loadShadersFromURLS(["quad.vert", "quad.frag", "site.vert", "site.frag"]).then(shaders => setup(shaders));
