
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

        positions = [],
        vertices = [],
        velocities = [],
        timers = [],

        scale = 0.050,
        smoothing = 500,

        ratio = cw / ch,
        // numParticles = 1024 * 1024;
        numParticles = 100000,

        // These are all used for the main rendering loop
        now,
        then = Date.now(),
        interval = 1000/60,
        delta = 1;

    function render() {
        window.requestAnimationFrame(render);
        now = Date.now();
        delta = now - then;

        if (delta > interval) {
            then = now - (delta % interval);
            draw();
        }
    }

    /**
     * THIS DOES NOT FUCKING WORK
     */
    function get_colour (arr) {

        if ( arr[0] < 0 || arr[1] < 0 || arr[0] > cw || arr[1] > ch ) return false;

        var index = arr[0] * arr[1] * 4;

        // console.log(
        //     imageData.data[((arr[1]*(imageData.width*4)) + (arr[0]*4),
        //     imageData.data[((arr[1]*(imageData.width*4)) + (arr[0]*4) + 1,
        //     imageData.data[((arr[1]*(imageData.width*4)) + (arr[0]*4) + 2,
        //     imageData.data[((arr[1]*(imageData.width*4)) + (arr[0]*4) + 3
        // );

        // console.log(arr[0] * imgData.width * 4  )
        // console.log( arr[0], arr[1], imgData.data[index], imgData.data[index+1], imgData.data[index+2], imgData.data[index+3] );
        // console.log(imgData.data[index])
        // console.log( arr[0], arr[1], pixels[index], pixels[index+1], pixels[index+2], pixels[index+3] );

        // console.log(pixels.length);
        // console.log([
        //     pixels[(arr[1]*(cw*4) + (arr[0]*4))],
        //     pixels[(arr[1]*(cw*4) + (arr[0]*4)) + 1],
        //     pixels[(arr[1]*(cw*4) + (arr[0]*4)) + 2],
        //     pixels[(arr[1]*(cw*4) + (arr[0]*4)) + 3]
        // ]);

        // console.log([
        //     pixels[arr[1]*4*imgData.width + arr[0]*4],
        //     pixels[arr[1]*4*imgData.width + arr[0]*4+1],
        //     pixels[arr[1]*4*imgData.width + arr[0]*4+2],
        //     pixels[arr[1]*4*imgData.width + arr[0]*4+3]
        // ])

        // debugger;
        return [
            pixels[arr[1]*4*cw + arr[0]*4],
            pixels[arr[1]*4*cw + arr[0]*4+1],
            pixels[arr[1]*4*cw + arr[0]*4+2],
            pixels[arr[1]*4*cw + arr[0]*4+3]
        ];

    }

    function clipspace (x, y) {
        return [ (x-cw2)/(cw2), (y-ch2)/(ch2) ];
    }

    /**
     * This works, so fuck off
     */
    function screenspace (x, y) {

        return [
            Math.floor((x * cw2) + cw2),
            Math.floor((y * ch2) + ch2)
        ];
    }

    function draw() {

        for ( var i = 0, l = vertices.length; i < l; i += 3 ) {

            var col = get_colour(
                screenspace(vertices[i], vertices[i+1])
            );

            if ( col !== false ) {
                dir.update([col[1]-0.5, 0.5-col[0]]).normalise();
                vel.update([velocities[i], velocities[i+1]]);
                pos.update(screenspace(vertices[i], vertices[i+1]));

                if ( vel.dot(dir) >= -0.6 ) {

                    dir
                        .multiplyEq(smoothing)
                        .multiplyEq(scale)
                        // .multiplyEq(0.05);
                }

                vel
                    .plusEq(dir);

                if ( vel.magnitude > 1 ) {
                    vel.normalise();
                }

                pos.plusEq(
                    vel.multiplyEq(scale)
                    // dir
                    // vel.multiplyEq(scale).multiplyEq(0.05)
                );

                vertices[i] = clipspace(pos.x, pos.y)[0];
                vertices[i+1] = clipspace(pos.x, pos.y)[1];

                velocities[i] = vel.x;
                velocities[i+1] = vel.y;

            } else {
                vertices[i] = (Math.random()*2) - 1;
                vertices[i + 1] = (Math.random()*2) - 1;
                velocities[i] = (Math.random() * 10) - 5;
                velocities[i+1] = (Math.random() * 10) - 5;
            }

            if ( timers[i] > 90 ) {
                var time = Math.random() * 50;
                timers[i] = time;
                vertices[i] = (Math.random()*2) - 1;
                vertices[i + 1] = (Math.random()*2) - 1;
                velocities[i] = (Math.random() * 10) - 5;
                velocities[i+1] = (Math.random() * 10) - 5;
            }

            timers[i]++;
        }

        gl.lineWidth(2.6);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays( gl.POINTS, 0, numParticles );
        gl.flush();

    }

    function init(ev) {

        // gl.viewport(0, 0, cw, ch);

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
            vertices.push( (Math.random() * 2) - 1, (Math.random() * 2) - 1, 0 );
            velocities.push( (Math.random() * 10) - 5, (Math.random() * 10) - 5, 0 );
            var time = Math.random() * 100;
            timers.push(time, time, time);
        }

        vertices = new Float32Array(vertices);
        velocities = new Float32Array(velocities);
        timers = new Float32Array(timers);

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

    /**
     * DOM has loaded
     * Get the hulk image and save the pixel data thereof into an array
     */
    $(function() {

        c.width = ic.width = cw;
        c.height = ic.height = ch;

        gl.viewport(0, 0, cw, ch);

        // document.body.appendChild(ic);
        // ic.className = 'image-canvas';

        var img = new Image();

        img.onload = function() {
            iw = img.width;
            ih = img.height;

            icx.drawImage(img, 0, 0, cw, ch);
            imgData = icx.getImageData(0, 0, cw, ch);

            pixels = new Float32Array(cw * ch * 4);

            imgData.data.forEach(function(v, i) {
                pixels[i] = (1 / 255) * v;
            });

            init();
        };

        img.src = "/assets/img/hulk.png";
    });


})(window,document,document.querySelectorAll('canvas')[0]);
