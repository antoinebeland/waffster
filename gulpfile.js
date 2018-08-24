'use strict';

const CONSTANTS = {
  BUILT_DIRECTORY: 'built',
  HEADER_LICENSE: '/*! BudgetViz | (c) Antoine Béland | GPL3 */\n',
  RELEASE_DIRECTORY: 'release',
  SOURCES_DIRECTORY: 'src',
  SERVER_PORT: 8080,
  STYLES_DIRECTORY: 'styles',
  TS_PROJECT_EXTRA_OPTIONS: {
    module: 'amd',
    outFile: 'app.js'
  }
};

const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const header = require('gulp-header');
const open = require('open');
const pump = require('pump');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json', CONSTANTS.TS_PROJECT_EXTRA_OPTIONS);
const rename = require("gulp-rename");
const sass = require('gulp-sass');
const scssLint = require('gulp-scss-lint');
const sourceMaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

/**
 * SASS Task
 * ---------
 * Compiles a SASS file.
 */
gulp.task('sass', function () {
  return gulp.src(`${CONSTANTS.BUILT_DIRECTORY}/**/${CONSTANTS.STYLES_DIRECTORY}/*.scss`)
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest(`./${CONSTANTS.BUILT_DIRECTORY}/assets/${CONSTANTS.STYLES_DIRECTORY}`));
});

/**
 * SCSS Lint
 * ---------
 * Validates the SCSS files.
 */
gulp.task('scss-lint', function() {
  return gulp.src(`${CONSTANTS.BUILT_DIRECTORY}/**/${CONSTANTS.STYLES_DIRECTORY}/*.scss`)
    .pipe(scssLint({
      'reporterOutputFormat': 'Checkstyle',
    }));
});

/**
 * Build Task
 * ----------
 * Compiles the files of the 'src' directory to generate a minified file
 * in the 'build' folder with a map file.
 */
gulp.task('build', function (cb) {
  try {
    const tsResult = tsProject.src()
      .pipe(sourceMaps.init())
      .pipe(tsProject());

    pump([
      tsResult.js,
      sourceMaps.write(".", { includeContent: true, sourceRoot: "../" + CONSTANTS.SOURCES_DIRECTORY }),
      gulp.dest(CONSTANTS.BUILT_DIRECTORY),
    ], cb);
  } catch(e) {
    console.error(e);
  }
});

/**
 * Release Task
 * ------------
 * Compiles the files of the 'src' directory to generate a minified file
 * in the 'build' folder without a map file.
 */
gulp.task('release', function (cb) {
  try {
    const tsResult = tsProject.src()
      .pipe(tsProject());

    pump([
      tsResult,
      babel({
        presets: ['env']
      }),
      uglify(),
      header(CONSTANTS.HEADER_LICENSE),
      rename({ suffix: '.min' }),
      gulp.dest(CONSTANTS.RELEASE_DIRECTORY)
    ], cb);
  } catch(e) {
    console.error(e);
  }
});

/**
 * Run Task
 * --------
 * Starts a web server and open the default web browser to the index file.
 */
gulp.task('run', function () {
  connect.server({
    port: CONSTANTS.SERVER_PORT,
    livereload: true
  });
  open(`http://localhost:${CONSTANTS.SERVER_PORT}/${CONSTANTS.BUILT_DIRECTORY}`);
});

/**
 * Default Task
 * ------------
 * Creates a watcher to automatically call the 'build' or 'sass' tasks when a project file is changed.
 * Starts the 'run' task.
 */
gulp.task('default', ['build', 'sass', 'run'], function () {
  function onChange(event) {
    console.log(`File ${event.path} was ${event.type}, running tasks...`);
  }
  gulp.watch(CONSTANTS.SOURCES_DIRECTORY + '/**/*.ts', ['build'])
    .on('change', onChange);

  gulp.watch(`${CONSTANTS.BUILT_DIRECTORY}/**/${CONSTANTS.STYLES_DIRECTORY}/*.scss`, ['sass'])
    .on('change', onChange);
});
