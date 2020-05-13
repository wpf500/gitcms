const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');

const gulpWebpack = require('webpack-stream');
const webpack = require('webpack');

const buildDir = './build';

function css() {
  return gulp.src('./public/stylesheets/**/*')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build/public/stylesheets'));
}

function js() {
  return gulp.src('./public/javascripts/main.js')
    .pipe(gulpWebpack(require('./webpack.config.js'), webpack)
    .on('error', error => {
      console.error(error);
      this.emit('end');
    }))
    .pipe(gulp.dest('./build/public/javascripts'));
}

function fonts() {
  return gulp.src('./public/fonts/**/*')
    .pipe(gulp.dest('./build/public/fonts'));
}

const build = gulp.parallel(css, js, fonts);

function watch() {
  const watcher = gulp.watch(['./public/**/*'], build);
  watcher.on('change', file => {
    console.log(`File ${file} was changed`);
  });
}

exports.build = build;
exports.default = gulp.series(build, watch);
