import { loadShadersFromURLS, setupWebGL, buildProgramFromSources } from "../../libs/utils.js";
import { vec2, flatten } from "../../libs/MV.js";

// Global variables declaration

/** @type {WebGL2RenderingContext} */
var gl;
/** @type {WebGLProgram} */
var program;
/** @type {WebGLVertexArrayObject} */
var vao;
var canvas;
var aBuffer;

const points = [];

function to_clip_space(x, y) {
    return vec2(
        (x / canvas.width) * 2 - 1,
        1 - (y / canvas.height) * 2   // invertido: os pixels crescem para baixo, o espaço de recorte cresce para cima
    );
}

function update_buffer() {
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

function setup(shaders) {
    // Setup

    // Get the canvas element in the web page
    /** @type {HTMLElement} */
    canvas = document.getElementById("gl-canvas");

    // Create the WebGL2 Rendering Context
    gl = setupWebGL(canvas);

    // Create the GLSL program from the shader sources (vertex + fragment)
    program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    // Create a buffer, make it current and store vertex data in it
    /** @type {WebGLBuffer} */
    aBuffer = gl.createBuffer();
    
    // Create a vertex array object to tell the GPU how to fetch vertex
    // data from the buffers, and make it current
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);

    // Get the attribute location for "a_position" attribute
    const a_position = gl.getAttribLocation(program, "a_position");
    // Describe layout of the attribute in the buffer
    // In this case, two floats tightly packed (no empty space between
    // consecutive vertices and no offset from the start of the buffer)
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    // Enable attribute fetching from the array
    gl.enableVertexAttribArray(a_position);

    // By now the vertex array has all the information to be used later
    // during rendering
    gl.bindVertexArray(null);

    canvas.addEventListener("click", (event) => {
        points.push(to_clip_space(event.offsetX, event.offsetY));
        update_buffer();
    });

    // Setup the viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Setup the background color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    
    // Call animate for the first time
    window.requestAnimationFrame(animate);
}

function animate() {
    // Trigger another call for the next frame update
    window.requestAnimationFrame(animate);

    // Drawing code

    // Clear the framebuffer with the background color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use the WebGL program created before
    gl.useProgram(program);

    // Make the vertex array object active (records how to fetch vertex data
    // from buffer)
    gl.bindVertexArray(vao);
    // Draw triangles using 3 vertices (one triangle)
    gl.drawArrays(gl.POINTS, 0, points.length);
    // Deactivate the vertex array object since drawing is complete
    gl.bindVertexArray(null);
}

loadShadersFromURLS(["shader.vert", "shader.frag"]).then(shaders => setup(shaders));
