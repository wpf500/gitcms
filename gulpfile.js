var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');

var gulpWebpack = require('webpack-stream');
var webpack = require('webpack');

var buildDir = './build';

gulp.task('css', function () {
  return gulp.src('./public/stylesheets/**/*')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build/public/stylesheets'));
});

gulp.task('js', function () {
  return gulp.src('./public/javascripts/main.js')
    .pipe(gulpWebpack(require('./webpack.config.js'), webpack).on('error', function (error) {
      console.log(error);
      this.emit('end');
    }))
    .pipe(gulp.dest('./build/public/javascripts'));
});

gulp.task('fonts', function () {
  return gulp.src('./public/fonts/**/*')
    .pipe(gulp.dest('./build/public/fonts'));
});

gulp.task('build', ['css', 'js', 'fonts']);

gulp.task('default', ['build'], function () {
  var watcher = gulp.watch(['./public/**/*'], ['build']);
  watcher.on('change', function (evt) {
    console.log('File ' + evt.path + ' was ' + evt.type);
  });
});
