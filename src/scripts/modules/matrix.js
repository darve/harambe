
'use strict';

//    Define the viewing frustum parameters
//    More info: http://en.wikipedia.org/wiki/Viewing_frustum
//    More info: http://knol.google.com/k/view-frustum
var fieldOfView = 30.0;
var aspectRatio = window.innerWidth/ window.innerHeight;
var nearPlane = 1.0;
var farPlane = 10000.0;
var top = nearPlane * Math.tan(fieldOfView * Math.PI / 360.0);
var bottom = -top;
var right = top * aspectRatio;
var left = -right;

//     Create the perspective matrix. The OpenGL function that's normally used for this,
//     glFrustum() is not included in the WebGL API. That's why we have to do it manually here.
//     More info: http://www.cs.utk.edu/~vose/c-stuff/opengl/glFrustum.html
var a = (right + left) / (right - left);
var b = (top + bottom) / (top - bottom);
var c = (farPlane + nearPlane) / (farPlane - nearPlane);
var d = (2 * farPlane * nearPlane) / (farPlane - nearPlane);
var x = (2 * nearPlane) / (right - left);
var y = (2 * nearPlane) / (top - bottom);
var perspectiveMatrix = [
    x, 0, a, 0,
    0, y, b, 0,
    0, 0, c, d,
    0, 0, -1, 0
];

//     Create the modelview matrix
//     More info about the modelview matrix: http://3dengine.org/Modelview_matrix
//     More info about the identity matrix: http://en.wikipedia.org/wiki/Identity_matrix
var modelViewMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

module.exports = {
    view: modelViewMatrix,
    perspective: perspectiveMatrix
};
