const gulp = require('gulp')
const webserver = require('gulp-webserver')
const watch = require('gulp-watch')

function monitorFiles(cb) {
    watch('src/**/*.html', () => gulp.series('appHtml')())
    watch('src/**/*.js', () => gulp.series('appJs')())
    watch('src/**/*.scss', () => gulp.series('appCSS')())
    watch('src/assets/**/*.*', () => gulp.series('appImg')())

    return cb()
}

function server() {
    return gulp.src('build')
        .pipe(webserver({
            port: 8080,
            open: true,
            livereload: true
        }))
}

module.exports = { monitorFiles, server }