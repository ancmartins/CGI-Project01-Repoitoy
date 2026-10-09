# **Why const angulo = (i / numTri) * 2 * Math.PI;**

2 * Math.pi representa o circulo inteiro em radianos

i / numTri representa a fatia do circulo que iria representar

# **Pq gl.drawArrays(gl.TRIANGLE_FAN, 0, numTri + 2);**

gl.TRIANGLE_FAN cria triangulos à volta do primeiro angulo fornecido, no nosso caso (0,0)

+2 vem dos angulos extras, o vertice (0,0) e do i <= N

