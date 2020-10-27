'use strict';

// Karma configuration
// Generated on Fri Apr 21 2017 19:34:22 GMT-0400 (EDT)
const puppeteer = require('puppeteer');
process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = function(config) {

  var sourcePreprocessors = 'coverage';

  function isDebug(argument) {
      return argument === '--debug';
  }
  if (process.argv.some(isDebug)) {
      sourcePreprocessors = [];
  }

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-ios9-uiwebview-patch/angular-ios9-uiwebview-patch.js',
      'node_modules/marked/lib/marked.js',
      'node_modules/angular-marked/dist/angular-marked.js',
      'node_modules/angular-resource/angular-resource.js',
      'node_modules/angular-sanitize/angular-sanitize.js',
      'node_modules/angularjs-scroll-glue/src/scrollglue.js',
      'node_modules/angular-ui-router/release/angular-ui-router.js',
      'node_modules/angular-websocket/dist/angular-websocket.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'vendor/jsrsasign-all-min.js',

      'public/js/app.js',
      'public/js/controllers/default.js',
      'public/js/controllers/play.js',
      'public/js/controllers/redhat.js',
      'public/js/controllers/site.js',
      'public/js/directives/profileCore.js',
      'public/js/services/auth.js',
      'public/js/services/commandHistory.js',
      'public/js/services/go_ga.js',
      'public/js/services/map.js',
      'public/js/services/playerSession.js',
      'public/js/services/playerSocket.js',
      'public/js/services/user.js',

      'public/templates/*.html',

      'test/**/*.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'public/js/**/*.js': sourcePreprocessors,
      'public/templates/*.html': 'ng-html2js'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage'],

    // configure the coverage reporter
    coverageReporter: {
      type: 'lcov',
      dir : 'reports',
      subdir: 'coverage'
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'public/templates',
      moduleName: 'templates'
    },

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
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  });
};
