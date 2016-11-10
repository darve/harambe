
'use strict';

/**
 * Hand maths helper functions.
 */
module.exports = (function() {

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Return the difference between two numbers
     * @param  {Number} a First number
     * @param  {Number} b Second number
     * @return {Number}   Difference between first and second numbers
     */
    function diff(a, b) {
        return Math.abs(a-b);
    }

    /**
     * Returns a number representing the scalar difference between
     * two numbers
     * @param  {Number} a First number
     * @param  {Number} b Second number
     * @return {Number}   Scalar difference between first and second numbers
     */
    function scale(a, b) {
        if ( a < b ) {
            return b/a;
        } else {
            return a/b;
        }
    }

    // B is the vector we are trying to fit A inside.
    // We should try and cache the window width and height
    // in here somehow.
    // @param  {Object} a Vector object
    // @param  {Object} b Vector object
    // @return {Number}   Ratio of the two numbers
    function vecscale(a, b) {

        if ( b.x < b.y ) {
            return (b.x / a.x);
        } else {
            return (b.y / a.y);
        }
    }

    /**
     * QUICKSORT
     * @param  {[type]} arr   An array you want to sort
     * @param  {[type]} left  First element of the array
     * @param  {[type]} right Last element of the array
     * @return {[type]}       [description]
     */
    function quickSort(arr, left, right) {
        var i = left,
            j = right,
            tmp,
            pivotidx = (left + right) / 2,
            pivot = parseInt(arr[pivotidx.toFixed()]);

        while (i <= j) {
            while (parseInt(arr[i]) < pivot)
               i++;
            while (parseInt(arr[j]) > pivot)
               j--;
            if (i <= j) {
               tmp = arr[i];
               arr[i] = arr[j];
               arr[j] = tmp;
               i++;
               j--;
            }
        }

        // Recursion
        if (left < j) quickSort(arr, left, j);
        if (i < right) quickSort(arr, i, right);
        return arr;
    }

    // var testarr = [8, 2, 5, 7, 4, 3, 12, 6, 19, 11, 10, 13, 9];
    // console.log(quickSort(testarr, 0, testarr.length-1));

    return {
        rand: rand,
        scale: scale,
        vecscale: vecscale,
        diff: diff
    };
})();
