
'use strict';

module.exports = (function() {

    var api = {},
        colours = [
            0xed5565,
            0xda4453,
            0xfc6e51,
            0xe9573f,
            0xffce54,
            0xfcbb42,
            0xa0d468,
            0x8cc152,
            0x48cfad,
            0x37bc9b,
            0x4fc1e9,
            0x3bafda,
            0x5d9cec,
            0x4a89dc,
            0xac92ec,
            0x967adc,
            0xec87c0,
            0xd770ad,
            0xf5f7fa,
            0xe6e9ed,
            0xccd1d9,
            0xaab2bd,
            0x656d78,
            0x434a54
        ];

    api.randomColour = function() {
        return colours[Math.floor(Math.random() * colours.length)];
    };

    return api;

})();
