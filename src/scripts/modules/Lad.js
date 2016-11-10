//
'use strict';

var Utils       = require('./Utils.js'),
    Vec         = require('./Vec.js'),
    M           = require('./Math.js'),
    Q           = require('q'),
    underscore  = require('underscore');

/**
 * Particle module for use with PIXI js
 */

var Lad = function(opts) {

    var _ = this;

    _.easingtype = 'easeOutBack';
    _.name = opts.name;
    _.pos = new Vec(opts.initial.pos.x, opts.initial.pos.y);
    _.viewscale = opts.viewscale;
    _.original = opts.original;
    _.initial = opts.initial;
    _.offset = opts.offset;
    _.sprite = opts.sprite;

    _.reboot = {};
    _.reboot.pos = new Vec( _.initial.pos.x, _.initial.pos.y );
    _.reboot.rotation = _.initial.rotation;
    _.reboot.width = _.initial.width;
    _.reboot.height = _.initial.height;
    _.reboot.alpha = _.initial.alpha;

    _.transitions = {
        position: [],
        alpha: [],
        rotation: [],
        scale: []
    };

    // Is this a PIXI.Graphics object?
    if ( 'anchor' in _.sprite ) {
        _.sprite.anchor.x = 0.5;
        _.sprite.anchor.y = 0.5;
    }

    _.sprite.width = opts.initial.width;
    _.sprite.height = opts.initial.height;
    _.sprite.alpha = opts.initial.alpha;

    // This bit is kind of a big deal and is DELIBERATELY not part of the initial object
    _.scale = _.sprite.scale.x;
    _.initial.scale = 1;

    _.sprite.position.x = opts.initial.pos.x;
    _.sprite.position.y = opts.initial.pos.y;
};

/**
 * Get the target properties and extend our target object with them
 * We should sort out the range of animation here: current - target?
 */
Lad.prototype.queue = function(name, transition) {
    transition.progress = 1;

    if ( this.transitions[name].length ) {
        transition.start = this.orient(name, this.transitions[name][this.transitions[name].length-1].end);
    } else {
        transition.start = this.orient(name);
    }

    if ( !underscore.isEqual(transition.start, transition.end) ) {
        this.transitions[name].push(transition);
    }

    return this;
};

/**
 * 1. Kill off any transitions
 * 2. Reset all properties to the ones that were given on instantiation
 */
Lad.prototype.reset = function() {

    var _ = this;

    _.transitions = {
        position: [],
        alpha: [],
        rotation: [],
        scale: []
    };

    _.initial.pos.x = _.reboot.pos.x;
    _.initial.pos.y = _.reboot.pos.y;
    _.initial.rotation = _.reboot.rotation;
    _.initial.width = _.reboot.width;
    _.initial.height = _.reboot.height;
    _.initial.alpha = _.reboot.alpha;

    _.sprite.position.x = _.reboot.pos.x;
    _.sprite.position.y = _.reboot.pos.y;

    if ( _.name === 'bigstar' ) {
        _.sprite.scale.x = _.scale;
        _.sprite.scale.y = _.scale;
    }

    if ( _.name === 'tree' ) {
        _.sprite.width = _.reboot.width;
        _.sprite.height = _.reboot.height;
    }

    _.sprite.alpha = _.reboot.alpha;
    _.sprite.rotation = _.reboot.rotation;
};

Lad.prototype.move = function(pos, speed, easing) {

    var vec;

    if ( this.transitions.position.length ) {
        vec = new Vec( Utils.last(this.transitions.position).end.pos.x, Utils.last(this.transitions.position).end.pos.y);
    } else {
        vec = new Vec( this.initial.pos.x, this.initial.pos.y );
    }

    this.queue('position', {
        speed: speed,
        easing: easing,
        end: {
            pos: vec.plusEq(pos)
        }
    });
    return this;
};

Lad.prototype.grow = function(scale, speed, easing) {
    var temp;

    if ( this.transitions.scale.length ) {
        temp = Utils.last(this.transitions.scale).end.scale;
    } else {
        temp = this.initial.scale;
    }

    this.queue('scale', {
        speed: speed,
        easing: easing,
        end: {
            scale: temp + scale
        }
    });
    return this;
};

/**
 * Return to the default home position (arranged as per the JSON)
 */
Lad.prototype.home = function(easing, speed) {
    this.queue('position', {
        easing: easing,
        speed: speed,
        end: {
            pos: new Vec(
                (this.original.pos.x * this.viewscale),
                (this.original.pos.y * this.viewscale) + this.offset
            )
        }
    });
    this.queue('scale', {
        easing: easing,
        speed: speed/2,
        end: {
            scale: 1
        }
    });
    this.queue('alpha', {
        easing: easing,
        speed: speed,
        end: {
            alpha: 1
        }
    });
};

/**
 * Generate start values for the transition (either from the end position of the
 * previous transition, or from the initial values)
 */
Lad.prototype.orient = function(name, last) {

    var obj = last || this.initial;
    switch (name) {
        case 'position': return { pos: new Vec( obj.pos.x, obj.pos.y )};
        case 'scale': return { scale: obj.scale };
        case 'rotation': return { rotation: obj.rotation };
        case 'alpha': return { alpha: obj.alpha };
    }
};

/**
 * Update the sprite with a new PIXI texture
 * We also need to update the initial scale values etc.
 */
Lad.prototype.updatesprite = function(texture) {

};

/**
 * Kill all the queued up transitions for a certain property
 */
Lad.prototype.kill = function(name) {
    this.transitions[name] = [];
};

Lad.prototype.killall = function() {
    this.transitions = {
        position: [],
        alpha: [],
        rotation: [],
        scale: []
    };
};

/**
 * Should this essentially take the last transition in the chain, copy it
 * and add the offset to the Y property?
 */
Lad.prototype.update = function(offset) {

    if ( offset !== this.offset && offset !== undefined ) {
        this.offset = offset;

        var newpos = this.transitions.position.length ?
            Utils.last(this.transitions.position).end.pos : this.original.pos;

        this.queue('position', {
            speed: 100,
            easing: 'easeOutBack',
            end: {
                pos: new Vec(newpos.x * this.viewscale, (newpos.y * this.viewscale) + this.offset)
            }
        });
    }
};

Lad.prototype.calcrotation = function(t) {

    var _ = this,
        rotation = Utils.easing[this.easingtype](
            t.progress,
            0,
            t.end.rotation - t.start.rotation,
            t.speed
        ) + t.start.rotation;

    _.sprite.rotation = rotation;

    if ( t.progress <= t.speed ) {
        t.progress++;
    } else {

        if (t) {
            _.sprite.rotation = t.end.rotation;

            if ('callback' in t) {
                t.callback();
            }
        }
        if (_.transitions.rotation.length === 1 ) _.initial.rotation = t.end.rotation;
        _.transitions.rotation.shift();
    }
};

Lad.prototype.calcalpha = function(t) {

    var _ = this,

        alpha = Utils.easing[_.easingtype](
            t.progress,
            0,
            t.end.alpha - t.start.alpha,
            t.speed) + t.start.alpha;

    _.sprite.alpha = alpha > 1 ? 1 : alpha;

    if ( t.progress <= t.speed ) {
        t.progress++;
    } else {
        if (t) {
            _.sprite.alpha = t.end.alpha;

            if ('callback' in t) {
                t.callback();
            }
        }
        if ( _.transitions.alpha.length === 1 ) _.initial.alpha = t.end.alpha;
        _.transitions.alpha.shift();
    }
};

Lad.prototype.calcposition = function(t) {

    var _ = this;

    _.sprite.position.x = Utils.easing[t.easing || _.easingtype](
        t.progress,
        0,
        t.end.pos.x - t.start.pos.x,
        t.speed) + t.start.pos.x;

    _.sprite.position.y = Utils.easing[_.easingtype](
        t.progress,
        0,
        t.end.pos.y - t.start.pos.y,
        t.speed) + t.start.pos.y;

    if ( t.progress <= t.speed) {
        t.progress++;
    } else {

        // We have reached the end of the transition, ensure the end values are actually applied to the sprite
        if (t) {
            _.sprite.position.x = t.end.pos.x;
            _.sprite.position.y = t.end.pos.y;

            if ('callback' in t) {
                t.callback();
            }
        }

        // Last transition, update the initial info. Should we do this always? Prably nat.
        if ( _.transitions.position.length === 1 ) {
            _.initial.pos.x = t.end.pos.x;
            _.initial.pos.y = t.end.pos.y;
        }

        _.transitions.position.shift();
    }
};

/**
 * Scaling examples
 * As far as the interface for this module is concerned, the scale is always 1,
 * so we need to convert the internal scale to work with that.
 * Scale is 0.56 -> 1. Transition wants to go to 2 -> scale * transition value.
 */
Lad.prototype.calcscale = function(t) {

    var _ = this,
        scale = Utils.easing[_.easingtype](
            t.progress,
            0,
            t.end.scale - t.start.scale,
            t.speed
        ) + t.start.scale;

    _.sprite.scale.x = _.scale * scale;
    _.sprite.scale.y = _.scale * scale;

    if ( t.progress <= t.speed ) {
        t.progress++;
    } else {
        if (t) {
            _.sprite.scale.x = _.scale * t.end.scale;
            _.sprite.scale.y = _.scale * t.end.scale;

            if ('callback' in t) {
                t.callback();
            }
        }

        if ( _.transitions.scale.length === 1 ) {
            _.initial.scale = t.end.scale;
        }
        _.transitions.scale.shift();
    }
};

Lad.prototype.calcsize = function(t) {

    var _ = this,
        width = Utils.easing[_.easingtype](
            t.progress,
            0,
            t.end.width - t.star.scale,
            t.speed
        ) + t.start.width,

        height = Utils.easing[_.easingtype](
            t.progress,
            0,
            t.end.height - t.star.scale,
            t.speed
        ) + t.start.height;

    _.sprite.height = height;
    _.scale = _.sprite.scale.x;

};

Lad.prototype.calcspeed = function() {
    // return this.angle.multiplyEq( this.distance/this.mulitplier );
};

Lad.prototype.calcdistance = function() {
    // return _.distance = _.pos.minusNew( _.targets.position.pos ).magnitude();
};

Lad.prototype.calcangle = function() {
    // return v.minusNew( this.pos ).normalise();
};

/**
 * Process the transitions for this Lad
 */
Lad.prototype.tick = function(now, mouse) {

    this.mouse = mouse;

    for ( var type in this.transitions ) {
        if ( this.transitions[type].length ) {
            this['calc' + type](this.transitions[type][0]);
        }
    }
};

module.exports = Lad;
