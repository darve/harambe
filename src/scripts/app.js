
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

        col,
        scale = 0.04,
        smoothing = 320,
        deltaTime = 0.016,

        x,
        y,

        ratio = cw / ch,
        // numParticles = 1024 * 1024;
        numParticles = 50000,
        scd = smoothing * scale * deltaTime,
        sd = scale * deltaTime,

        // These are all used for the main rendering loop
        now,
        then = Date.now(),
        interval = 1000/60,
        delta = 1,
        lifetime = 2000;

    /**
     * Rendering loop
     */
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
     * Returns the pixel data for a given position in screenspace
     * @param  {Array} arr index 0 is x, index 1 is y
     */
    function get_colour (arr) {

        x = Math.floor(arr[0]);
        y = Math.floor(arr[1]);

        return [
            pixels[y*4*cw + x*4 + 0],
            pixels[y*4*cw + x*4 + 1],
            pixels[y*4*cw + x*4 + 2],
            pixels[y*4*cw + x*4 + 3]
        ];

    }

    function get_channel_smooth(x,y,channel){

        var x_ = Math.floor(x)
        var y_ = Math.floor(y)
        var lerp_x = x - x_;
        var lerp_y = y - y_;

        var a = get_channel(x,y,channel)
        var b = get_channel(x_,y_,channel)
        return (lerp(a,b,lerp_x) + lerp(a,b,lerp_y))/2;
    }

    function lerp(a, b, t){
        return a*(1-t)+b*t;
    }

    function get_channel(x,y, channel){
         return pixels[y*4*cw + x*4 + channel];
    }


    function clipspace (x, y) {

        return [ (x-cw2)/(cw2), (y-ch2)/(ch2) ];

    }

    /**
     * Convert clipspace to screenspace
     */
    function screenspace (x, y) {

        return [
           (((x * cw2) + cw2)),
           (((y * ch2) + ch2))
        ];
    }

    /**
     * A vertex is either off screen or has run out of time, reset it.
     */
    function resetVertex (i) {

        timers[i] = Math.random() * lifetime;
        vertices[i] = (Math.random() * 2) - 1;
        vertices[i + 1] = (Math.random() * 2) - 1;
        velocities[i] = (Math.random() * 10) - 5;
        velocities[i+1] = (Math.random() * 10) - 5;

    }

    function draw() {

        for ( var i = 0, l = vertices.length; i < l; i += 3 ) {

            // Returns the RGBA values for the position vector - returns false if out of bounds.
            col = get_colour( screenspace(vertices[i], vertices[i+1]) );

            if ( col !== false && col[0] > 0 ) {

                if ( timers[i] > lifetime ) {
                    resetVertex(i);
                }

                // Assign values to our direction, velocity and position vectors
                dir.update([col[1]-0.5, 0.5-col[0]]).normalise();
                // .multiplyEq(1.5);
                vel.update([velocities[i], velocities[i+1]]);
                pos.update([vertices[i], vertices[i+1]]);

                dir.multiplyEq(scd);
                vel.plusEq(dir);

                if ( vel.magnitude() > 5) {
                    vel.normalise().multiplyEq(5);
                }

                velocities[i] = vel.x;
                velocities[i+1] = vel.y;

                vel.multiplyEq(sd)
                pos.plusEq(vel);

                vertices[i] = pos.x;
                vertices[i+1] = pos.y;

            } else {
                resetVertex(i);
            }

            timers[i]++;
        }

        // gl.lineWidth(2.6);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays( gl.POINTS, 0, numParticles );
        gl.flush();

    }

    function init(ev) {

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

        /**
         * Generate our initial positions and velocities for our particles
         */
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

            icx.save();
            icx.scale(1, -1);
            icx.drawImage(img, 0, 0, cw, -ch);
            icx.restore();
            imgData = icx.getImageData(0, 0, cw, ch);

            pixels = new Float32Array(cw * ch * 4);

            imgData.data.forEach(function(v, i) {
                pixels[i] = (1 / 255) * v;
            });

            icx.clearRect(0, 0, cw, ch);
            icx.drawImage(img, 0, 0, cw, ch);

            init();
        };

        img.src = "/assets/img/hulk.png";
    });

})(window,document,document.querySelectorAll('canvas')[0]);
