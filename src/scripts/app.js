
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
        cw2 = cw/2,
        ch2 = ch/2,

        ic = document.createElement('canvas'),
        icx = ic.getContext('2d'),
        iw,
        ih,

        pos = new Vec(0, 0),
        dir = new Vec(0, 0),
        vel = new Vec(0, 0),

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

        scale = 0.04,
        smoothing = 500,

        ratio = cw / ch,
        // numParticles = 1024 * 1024;
        numParticles = 200000,

        // These are all used for the main rendering loop
        now,
        then = Date.now(),
        interval = 1000/60,
        delta = 1;

    /**
     * THIS DOES NOT FUCKING WORK
     */
    function get_colour (arr) {

        var index = arr[0] * arr[1] * 4;
        // console.log('get color', arr[0], arr[1]s, index, [pixels[index], pixels[index+1], pixels[index+2], pixels[index+3]]);

        return [
            pixels[index],
            pixels[index+1],
            pixels[index+2],
            pixels[index+3]
        ];

    }

    function clipspace (x, y) {
        return [ (x-cw2)/(cw2), (y-ch2)/(ch2) ];
    }

    /**
     * This works, so fuck off
     */
    function screenspace (x, y) {
        return [ Math.floor((x * cw2) + cw2), Math.floor((y * ch2) + ch2) ];
    }

    function render() {
        window.requestAnimationFrame(render);
        now = Date.now();
        delta = now - then;

        if (delta > interval) {
            then = now - (delta % interval);
            draw();
        }
    }

    function draw() {

        for ( var i = 0, l = vertices.length; i < l; i += 3 ) {

            var col = get_colour(screenspace(vertices[i], vertices[i+1]));

            dir.x = col[1] - 0.5;
            dir.y = 0.5 - col[0];
            dir.divideEq(100);

            // console.log(dir);
            // debugger;

            vel.x = velocities[i];
            vel.y = velocities[i+1];

            // console.log(dir.dot(vel));
            if ( dir.dot(vel) >= -0.6 ) {
                vel.plusEq(dir)
                // .multiplyEq(smoothing * scale);
            }

            // if ( vel.x*vel.x+vel.y*vel.y > 1 ) {
            //     vel.normalise();
            // }

            // vel.normalise();

            pos.x = vertices[i];
            pos.y = vertices[i+1];

            // console.log(pos.x, pos.y, vel.x, vel.y);
            // debugger;

            // pos.x += vel.x;
            // pos.y += vel.y;

            // dir.normalise();



            // pos.plusEq(vel.normalise());
            // pos.plusEq(vel.multiplyNew(scale*delta));

            // console.log(vel);
            // debugger;
            pos.plusEq(vel);

            vertices[i] = pos.x;
            vertices[i+1] = pos.y;

            // console.log(vertices[i], vertices[i+1]);
        }

        gl.lineWidth(2.6);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays( gl.POINTS, 0, numParticles );
        gl.flush();

    }

    window.dave = draw;

    function init(ev) {

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
            vertices.push((Math.random()*2) - 1, (Math.random()*2) - 1, 0);
            // vertices.push(0, 0, 0);
            // vertices.push( (Math.random() * 2 - 1)*.05, (Math.random() * 2 - 1)*.05, 1.83 );
            // velocities.push( (Math.random() * 2 - 1)*.05, (Math.random() * 2 - 1)*.05, .93 + Math.random()*.02 );
            // velocities.push( 0.001, 0.001, 0);
            velocities.push(
                ((Math.random()*2) - 1) / 1000,
                ((Math.random()*2) - 1) / 1000,
                0
            );
        }

        vertices = new Float32Array(vertices);
        velocities = new Float32Array(velocities);

        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        vertexPosition = gl.getAttribLocation(program, 'vertexPosition');
        gl.enableVertexAttribArray(vertexPosition);

        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

        vertexPosAttribLocation = gl.getAttribLocation(program, "vertexPosition");
        gl.vertexAttribPointer(vertexPosAttribLocation, 3.0, gl.FLOAT, false, 0, 0);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays( gl.POINTS, 0, numParticles );

        requestAnimationFrame(render);
    }

    $(function() {

        c.width = ic.width = cw;
        c.height = ic.height = ch;

        // document.body.appendChild(ic);
        // ic.className = 'image-canvas';

        var img = new Image();

        img.onload = function() {
            iw = img.width;
            ih = img.height;
            icx.drawImage(img, 0, 0, window.innerWidth, window.innerHeight);
            imgData = icx.getImageData(0, 0, window.innerWidth, window.innerHeight);
            pixels = new Float32Array(window.innerWidth * window.innerHeight * 4);

            imgData.data.forEach(function(v, i) {
                pixels[i] = (1 / 255) * v;
            });

            init();
        };

        img.src = "/assets/img/hulk.png";
    });

    // $(init);

})(window,document,document.querySelectorAll('canvas')[0]);
