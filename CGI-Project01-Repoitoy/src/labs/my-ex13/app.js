import { loadShadersFromURLS, setupWebGL, buildProgramFromSources } from "../../libs/utils.js";
import { vec2, vec3, flatten } from "../../libs/MV.js";

/** @type {WebGL2RenderingContext} */
var gl;
/** @type {WebGLProgram} */
var program;
/** @type {WebGLVertexArrayObject} */
var vao;
/** @type {WebGLBuffer} */
var positionBuffer;
/** @type {WebGLBuffer} */
var colorBuffer;
/** @type {HTMLCanvasElement} */
var canvas;

// Arrays para guardar as posições e cores dos triângulos já confirmados[cite: 2]
const positions = [];
const colors = [];

// Arrays temporários para memorizar os vértices do triângulo atual (até completar 3)[cite: 2]
const pendingPositions = [];
const pendingColors = [];

/**
 * Gera uma cor RGB aleatória[cite: 2]
 */
function random_color() {
    return vec3(Math.random(), Math.random(), Math.random());
}

/**
 * Converte coordenadas do ecran em pixels para espaço de recorte [-1, 1][cite: 2]
 */
function to_clip_space(x, y) {
    return vec2(
        (x / canvas.width) * 2 - 1,
        1 - (y / canvas.height) * 2
    );
}

/**
 * Reenvia a lista de posições e cores atualizadas para a GPU[cite: 2]
 */
function update_buffers() {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
}

function setup(shaders) {
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas);

    program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    // Criar buffers para posições e cores
    positionBuffer = gl.createBuffer();
    colorBuffer = gl.createBuffer();

    // Criar e configurar o VAO
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Configuração do atributo de Posição
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const a_position = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_position);

    // Configuração do atributo de Cor[cite: 2]
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    const a_color = gl.getAttribLocation(program, "a_color");
    gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_color);

    gl.bindVertexArray(null);

    // Registo de cliques do rato[cite: 2]
    canvas.addEventListener("click", (event) => {
        // Memorizar posição e cor aleatória do clique[cite: 2]
        pendingPositions.push(to_clip_space(event.offsetX, event.offsetY));
        pendingColors.push(random_color());

        // Quando acumular 3 vértices, adiciona ao triângulo final e atualiza os buffers[cite: 2]
        if (pendingPositions.length === 3) {
            positions.push(...pendingPositions);
            colors.push(...pendingColors);

            // Limpa os temporários
            pendingPositions.length = 0;
            pendingColors.length = 0;

            update_buffers();
        }
    });

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    window.requestAnimationFrame(animate);
}

function animate() {
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    // Desenha todos os triângulos completados até ao momento[cite: 2]
    if (positions.length > 0) {
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES, 0, positions.length);
        gl.bindVertexArray(null);
    }
}

loadShadersFromURLS(["shader.vert", "shader.frag"]).then(shaders => setup(shaders));