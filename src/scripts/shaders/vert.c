attribute vec3 vertexPosition;
// attribute vec2 a_texCoord;

uniform mat4 modelViewMatrix;
uniform mat4 perspectiveMatrix;

// uniform sampler2D u_texture;

// varying vec2 v_texCoord;

void main(void) {
	gl_PointSize = 4.0;
	gl_Position = perspectiveMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);
}