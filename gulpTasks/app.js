const gulp = require('gulp')
const babel = require('gulp-babel')
const uglifycss = require('gulp-uglifycss')
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')

function appCSS(cb) {
    return gulp.src('src/css/style.css')
        .pipe(uglifycss({'uglifycoments': true}))
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest('build/css'))
}

function appHtml(cb) {
    return gulp.src('src/index.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('build'))
}

function appJs() {
    return gulp.src('src/js/**/*.js')
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('build/js'))
}

function appImg() {
    return gulp.src('src/assets/**/*.png')
        .pipe(gulp.dest('build/assets'))
}

gulp.task('appHtml', appHtml)
gulp.task('appJs', appJs)
gulp.task('appCSS', appCSS)
gulp.task('appImg', appImg)

module.exports = { appCSS, appHtml, appJs, appImg }