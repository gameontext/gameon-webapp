'use strict';

// Karma configuration
// Generated on Fri Apr 21 2017 19:34:22 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'public/bower_components/angular/angular.js',
      'public/bower_components/angular-resource/angular-resource.js',
      'public/bower_components/angular-sanitize/angular-sanitize.js',
      'public/bower_components/angular-ui-router/release/angular-ui-router.js',
      'public/bower_components/angular-websocket/dist/angular-websocket.js',
      'public/bower_components/angular-scroll-glue/src/scrollglue.js',
      'public/bower_components/jsrsasign/jsrsasign-latest-all-min.js',
      'public/bower_components/angular-ios9-uiwebview-patch/angular-ios9-uiwebview-patch.js',
      'public/bower_components/marked/lib/marked.js',
      'public/bower_components/angular-marked/dist/angular-marked.js',
      'public/bower_components/angular-mocks/angular-mocks.js',

      'public/scripts/app.js',
      'public/scripts/controllers/default.js',
      'public/scripts/controllers/play.js',
      'public/scripts/controllers/site.js',
      'public/scripts/directives/profileCore.js',
      'public/scripts/services/ga.js',
      'public/scripts/services/playerSocket.js',
      'public/scripts/services/playerSession.js',
      'public/scripts/services/auth.js',
      'public/scripts/services/user.js',
      'public/scripts/services/commandHistory.js',
      'public/scripts/services/map.js',

      'test/**/*.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'public/scripts/**/*.js': ['coverage']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage'],

    // configure the coverage reporter
    coverageReporter: {
      dir : 'coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'json', subdir: '.' }
      ]
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,

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
    concurrency: Infinity
  });
};
