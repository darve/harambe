attribute vec3 vertexPosition;


void main(void) {
	gl_PointSize = 2.0;
	gl_Position = vec4(vertexPosition, 1.0);
}