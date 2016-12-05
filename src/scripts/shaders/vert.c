attribute vec3 vertexPosition;


void main(void) {
	gl_PointSize = 8.0;
	gl_Position = vec4(vertexPosition, 1.0);
}