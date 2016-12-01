
'use strict';

var
    Vec         = require('./modules/Vec'),
    M           = require('./modules/Math'),
    Utils       = require('./modules/Utils'),
    gfx         = require('./modules/Graphics'),
    vert_shader = require('./shaders/vert.c'),
    frag_shader = require('./shaders/frag.c'),
    matrix      = require('./modules/Matrix'),
    // Track       = require('./modules/Track'),
    $           = require('jquery');

'use strict';

(function(win,doc,c) {

    var gl = c.getContext('webgl'),
        cw = win.innerWidth,
        ch = win.innerHeight,

        ic = document.createElement('canvas'),
        icx = ic.getContext('2d'),

        imgData,
        pixels,

        vertexShader = gl.createShader(gl.VERTEX_SHADER), // Represents an instance of a vertex shader
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER), // Represents an instance of a fragment shader
        program = gl.createProgram(),

        tex,
        textureCoordAttribute,
        samplerLoc,

        vertexPosition,
        vertexPosAttribLocation,
        vertexBuffer,

        uModelViewMatrix,
        uPerspectiveMatrix,

        vertices = [],
        velocities = [],

        ratio = cw / ch,
        // numParticles = 1024 * 1024;
        numParticles = 100000;

    function draw() {

        var i, n = vertices.length, p, bp;
        for ( i = 0; i < numParticles; i += 2 ) {

            bp = i*3;

            // copy old positions
            vertices[bp] = vertices[bp+3];
            vertices[bp+1] = vertices[bp+4];

            // inertia
            velocities[bp] *= velocities[bp+2];
            velocities[bp+1] *= velocities[bp+2];

            // horizontal
            p = vertices[bp+3];
            p += velocities[bp];

            if ( p < -ratio ) {
                p = -ratio;
                velocities[bp] = Math.abs(velocities[bp]);
            } else if ( p > ratio ) {
                p = ratio;
                velocities[bp] = -Math.abs(velocities[bp]);
            }

            vertices[bp+3] = p;

            // vertical
            p = vertices[bp+4];
            p += velocities[bp+1];

            if ( p < -1 ) {
                p = -1;
                velocities[bp+1] = Math.abs(velocities[bp+1]);
            } else if ( p > 1 ) {
                p = 1;
                velocities[bp+1] = -Math.abs(velocities[bp+1]);
            }

            vertices[bp+4] = p;

            if ( touched ) {

                var dx = touchX - vertices[bp],
                    dy = touchY - vertices[bp+1],
                    d = Math.sqrt(dx * dx + dy * dy);

                if ( d < 2 ) {
                    // if ( d < .03 ) {
                    //     vertices[bp+3] = (Math.random() * 2 - 1)*ratio;
                    //     vertices[bp+4] = Math.random() * 2 - 1;
                    //     velocities[bp] = 0;
                    //     velocities[bp+1] = 0;
                    // } else {
                        dx /= d;
                        dy /= d;
                        d = ( 2 - d ) / 2;
                        d *= d;
                        velocities[bp] += dx * d * .01;
                        velocities[bp+1] += dy * d * .01;
                    // }
                }
            }
        }

        gl.lineWidth(2.6);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays( gl.POINTS, 0, numParticles );
        gl.flush();

        requestAnimationFrame(draw);
    }

    function init(ev) {

        c.width = ic.width = cw;
        c.height = ic.height = ch;

        gl.viewport(0, 0, cw, ch);

        // Load the vertex shader source (vert.c)
        gl.shaderSource(vertexShader, vert_shader());
        gl.compileShader(vertexShader);

        gl.shaderSource(fragmentShader, frag_shader());
        gl.compileShader(fragmentShader);

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);
        gl.useProgram(program);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);

        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

        for ( var i = 0; i < numParticles; i++ ) {
            vertices.push(0, 0, 1.83);
            velocities.push( (Math.random() * 2 - 1)*.05, (Math.random() * 2 - 1)*.05, .93 + Math.random()*.02 );
            // velocities.push( 0.5, 0.5, 0.5);
        }

        vertices = new Float32Array(vertices);
        velocities = new Float32Array(velocities);

        // tex = gl.createTexture();

        // gl.bindTexture(gl.TEXTURE_2D, tex);
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
        // // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        // // gl.generateMipmap(gl.TEXTURE_2D);
        // // gl.bindTexture(gl.TEXTURE_2D, null);

        // samplerUniform = gl.getUniformLocation(program, "u_texture");

        // gl.activeTexture(gl.TEXTURE0);
        // gl.bindTexture(gl.TEXTURE_2D, tex);
        // gl.uniform1i(samplerUniform, 0);

        // textureCoordAttribute = gl.getAttribLocation(program, "a_texCoord");
        // gl.enableVertexAttribArray(textureCoordAttribute);
        // gl.vertexAttribPointer(texCoordAttribute, 2, gl.FLOAT, false, 0, 0);

        // tex = gl.createTexture();
        // gl.bindTexture(gl.TEXTURE_2D, tex);

        // // Set the parameters so we can render any size image.
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);

        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        vertexPosition = gl.getAttribLocation(program, 'vertexPosition');
        gl.enableVertexAttribArray(vertexPosition);

        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        vertexPosAttribLocation = gl.getAttribLocation(program, "vertexPosition");
        gl.vertexAttribPointer(vertexPosAttribLocation, 3.0, gl.FLOAT, false, 0, 0);

        uModelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
        uPerspectiveMatrix = gl.getUniformLocation(program, "perspectiveMatrix");

        gl.uniformMatrix4fv(uModelViewMatrix, false, new Float32Array(matrix.view));
        gl.uniformMatrix4fv(uPerspectiveMatrix, false, new Float32Array(matrix.perspective));

        requestAnimationFrame(draw);
    }

    $(function() {
        var img = new Image();
        img.onload = function() {
            icx.drawImage(img, 0, 0);
            imgData = icx.getImageData(0, 0, img.width, img.height);
            icx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            pixels = new Uint8Array(img.width * img.height * 4);
            imgData.data.forEach(function(v, i) {
                pixels[i] = v;
            });
            init();
        };
        img.src = "/assets/img/hulk.png";
    });

    // $(init);

})(window,document,document.querySelectorAll('canvas')[0]);
