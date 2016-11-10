
'use strict';

var test    = require('tape'),
    Vec     = require('../../src/scripts/modules/Vec.js'),
    M       = require('../../src/scripts/modules/Math.js'),

    vecA,
    vecB,
    rand,
    result;

test('Vector addition', function(t){

    var // Run each set of tests three times
        count = 3;

    // Two tests per set
    t.plan(count * 2);

    // Manually add the vector components then check if the library is producting the correct result
    // Floating point
    for ( var i = 1; i <= count; i++) {
        vecA = new Vec(M.rand(3, 2), M.rand(3, 2));
        vecB = new Vec(M.rand(3, 2), M.rand(3, 2));
        t.deepEqual(vecA.plusNew(vecB), { x: (vecA.x + vecB.x), y: (vecA.y + vecB.y) }, vecA + ' + ' + vecB + ' === ' + vecA.plusNew(vecB));
    }

    // Integer
    for ( var i = 1; i <= count; i++) {
        vecA = new Vec(M.rand(10, 0), M.rand(10, 0));
        vecB = new Vec(M.rand(10, 0), M.rand(10, 0));
        t.deepEqual(vecA.plusNew(vecB), { x: (vecA.x + vecB.x), y: (vecA.y + vecB.y) }, vecA + ' + ' + vecB + ' === ' + vecA.plusNew(vecB));
    }
});

test('Vector multiplication', function(t){

    var // Run each set of tests three times
        count = 3;

    // Two tests per set
    t.plan(count * 2);

    // Manually multiply the vector components then check if the library is producing the correct result
    for ( var i = 1; i <= count; i++) {
        vecA = new Vec(M.rand(3, 2), M.rand(3, 2));
        rand = M.rand(3, 2);
        t.deepEqual(vecA.multiplyNew(rand), { x: (vecA.x * rand), y: (vecA.y * rand) }, vecA + ' * ' + rand + ' === ' + vecA.multiplyNew(rand));
    }

    for ( var i = 1; i <= count; i++) {
        vecA = new Vec(M.rand(10, 0), M.rand(10, 0));
        rand = M.rand(10, 0);
        t.deepEqual(vecA.multiplyNew(rand), { x: (vecA.x * rand), y: (vecA.y * rand) }, vecA + ' * ' + rand + ' === ' + vecA.multiplyNew(rand));
    }
});

test('Vector division', function(t){

    var // Run each set of tests three times
        count = 3;

    // Two tests per set
    t.plan(count * 2);

    for ( var i = 1; i <= count; i++) {
        vecA = new Vec(M.rand(3, 2), M.rand(3, 2));
        rand = M.rand(3, 2);
        t.deepEqual(vecA.divideNew(rand), { x: (vecA.x / rand), y: (vecA.y / rand) }, vecA + ' / ' + rand + ' === ' + vecA.divideNew(rand));
    }

    for ( var i = 1; i <= count; i++) {
        vecA = new Vec(M.rand(10, 0), M.rand(10, 0));
        rand = M.rand(10, 0);
        t.deepEqual(vecA.divideNew(rand), { x: (vecA.x / rand), y: (vecA.y / rand) }, vecA + ' / ' + rand + ' === ' + vecA.divideNew(rand));
    }
});

test('Vector normalisation', function(t) {

    var // Run each set of tests three times
        count = 3;

    t.plan(count * 2);

    for ( var i = 1; i <= count; i++) {
        vecA = new Vec(M.rand(15, 2), M.rand(15, 2));
        t.ok(vecA.normalise().x <= 1, 'x value of normalised vector should be less than 1: ' + vecA.x);
        t.ok(vecA.normalise().y <= 1, 'y value of normalised vector should be less than 1: ' + vecA.y);
    }
});

test('Vector proximity test (isCloseTo)', function(t){
    t.plan(3);
    t.ok(new Vec(3,3).isCloseTo(new Vec(1,1), 5), '(3,3) is within 5 distance of (1,1)');
    t.notOk(new Vec(3,3).isCloseTo(new Vec(50,50), 5), '(3,3) is NOT within 5 distance of (50,50)');
    t.ok(new Vec(3,3).isCloseTo(new Vec(3.1,3.1), 5), '(3,3) is within 5 distance of (3.1,3.1)');
});
