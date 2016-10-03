// Karma configuration
// Generated on Tue Sep 27 2016 23:15:13 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: 'src/public',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'bower_components/angular/angular.js',
        '../../test/captureAngularModules.js',
        'bower_components/angular-resource/angular-resource.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/angular-websocket/angular-websocket.min.js',
        'bower_components/angular-scroll-glue/src/scrollglue.js',
        'bower_components/jsrsasign/jsrsasign-latest-all-min.js',
        'bower_components/angular-ios9-uiwebview-patch/angular-ios9-uiwebview-patch.js',
        'bower_components/marked/lib/marked.js',
        'bower_components/angular-marked/dist/angular-marked.js',
        'bower_components/angular-mocks/angular-mocks.js',

        'scripts/app.js',
        'scripts/controllers/default.js',
        'scripts/controllers/play.js',
        'scripts/directives/profileCore.js',
        'scripts/directives/tabs.js',
        'scripts/services/playerSocket.js',
        'scripts/services/playerSession.js',
        'scripts/services/auth.js',
        'scripts/services/user.js',
        'scripts/services/commandHistory.js',
        'scripts/services/map.js',

        '../../test/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    plugins: [
        'karma-jasmine'
    ]
  })
}
