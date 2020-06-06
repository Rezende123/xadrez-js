const { series } = require('gulp')

const { appCSS, appHtml, appJs } = require('./gulpTasks/app')
const { monitorFiles, server } = require('./gulpTasks/servidor')

exports.default = series(
    appHtml, appCSS, appJs,
    server, monitorFiles
)