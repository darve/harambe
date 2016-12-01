'use strict';

var gulp            = require('gulp'),

    // SASS compiler
    sass            = require('gulp-sass'),

    // Used to automatically add in css browser prefixes so we can just write lovely CSS3 without worrying
    autoprefixer    = require('gulp-autoprefixer'),

    // Used to minify our compiled CSS
    mincss          = require('gulp-minify-css'),

    // Used for minifying javascript
    uglify          = require('gulp-uglify'),

    // Used for linting javascript and checking for issues
    jshint          = require('gulp-jshint'),

    // Used for modular javascript development
    browserify      = require('browserify'),

    // Use conventional text streams at the start of your gulp or vinyl pipelines
    source          = require('vinyl-source-stream'),

    // Converts streaming vinyl files to use buffers
    buffer          = require('vinyl-buffer'),

    // Used for generating sourcemaps of minified javascript files.
    sourcemaps      = require('gulp-sourcemaps'),

    // I'll be honest, I have no idea what this does.
    gutil           = require('gulp-util'),

    // Test-runner
    tape            = require('gulp-tape'),

    // Reporter used by the test runner
    tap             = require('tap-colorize'),

    // These are used to perform tasks differently depending on the args
    argv            = require('yargs').argv,
    gulpif          = require('gulp-if'),
    rename          = require('gulp-rename'),

    shaderify       = require('browserify-shader');


/**
 * Polyfill required so the autoprefixer doesn't break.
 */
require('es6-promise').polyfill();


/**
 * Bundle and minify all of the source script files
 */
gulp.task('scripts', ['jshint'], function () {

    return browserify({ entries: './src/scripts/app.js', debug: true })
        .transform(shaderify, {})
        .bundle()
        .pipe(source('wax.js'))
        .pipe(buffer())
        .on('error', gutil.log)
        .pipe(gulp.dest('./app/assets/scripts'));
});


/**
 * This task is used to verify that I am not taking crazy pills
 * and that my javascript is in fact perfectly formed.
 */
gulp.task('jshint', function() {
    return gulp.src('./src/scripts/**/*.js')
        .pipe(jshint(require('./config/jshint.js')))
        .pipe(jshint.reporter('default'))
});


/**
 * This task compiles, nay transforms my sass into a hard
 * shiny peg of truth (CSS). Compiles scss files for dev.
 * Minifies if this task is run with the production argument.
 */
gulp.task('sass', function() {

    return gulp.src('./src/scss/*.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulpif(argv.production, mincss()))
        .pipe(gulpif(argv.production, rename({suffix: '.min'})))
        .pipe(gulp.dest('./app/assets/css'));
});


/**
 * Run the TAPE tests
 */
gulp.task('test', function() {

    return gulp.src('./tests/tape/*.js')
        .pipe(tape({
            reporter: tap()
        }));
});


/**
 * This task is used to lint and minify everything and stick
 * it in a folder called 'prod'.
 */
gulp.task('build', ['jshint', 'sass', 'scripts']);


/**
 *  Watch our source files and trigger a build when they change
 */
gulp.task('watch', function() {

    gulp.watch([
        './src/scripts/**/*.js',
        './src/scripts/shaders/*.c',
        './src/scss/**'
    ], ['build']);
});
