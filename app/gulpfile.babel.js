'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import cssnano from 'gulp-cssnano';
import hash from 'gulp-hash';
import hashReferences from 'gulp-hash-references';
import jshint from 'gulp-jshint';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import print from 'gulp-print';
import rename from 'gulp-rename';
import size from 'gulp-size';
import stylelint from 'gulp-stylelint';
import templateCache from 'gulp-angular-templatecache';
import uglify from 'gulp-uglify';
import gutil from 'gulp-util';

import browserSync from 'browser-sync';
import del from 'del';
import karma from 'karma';
import cssImport from 'postcss-import';
import cssnext from 'postcss-cssnext';
import htmlValidate from 'html-angular-validate';
import through from 'through2';

const jwt = require('jsonwebtoken');
const fs = require('fs');

var bs = {};

const onError = (err) => {
  console.log(err);
};

const hash_mf = {
  deleteOld: true,
  sourceDir: __dirname + '/dist'
};

function defaultReportFn(fileFailures) {
  gutil.log(gutil.colors.red('Found validation failures'));

	for (var i = 0; i < fileFailures.length; i++) {
		var fileResult = fileFailures[i];
    gutil.log(gutil.colors.yellow(fileResult.filepath));

		for (var j = 0; j < fileResult.errors.length; j++) {
			var err = fileResult.errors[j];
			if (err.line !== undefined) {
				gutil.log(gutil.colors.red('  --[' +
				  err.line +
				  ':' +
				  err.col +
				  '] ' +
				  err.msg));
			} else {
				gutil.log(gutil.colors.red('  --[fileResult] ' + err.msg));
			}
		}
	}
}

function wrapper(file, options, cb) {
  var errorMessage = 'HTML Validation errors found!';

  htmlValidate.validate(file.path, options).then(function(result) {
    if (result.allpassed) {
      cb();
    } else {
      defaultReportFn(result.failed);

      if (options.errorInCallback) {
        cb(errorMessage);
      } else {
        cb();
      }
    }
  }, function(err) { // Unable to validate files
    gutil.log(gutil.colors.red('htmlangular error: ' + err));
    cb(err);
  });
}

function validate(options) {
  options = options || {};

  var stream = through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return cb();
    }
    if (file.isStream()) {
      gutil.log(gutil.colors.red('htmlangular error: streams are not supported'));
      return cb();
    }
    if (file.isBuffer()) {
      wrapper.call(this, file, options, cb);
    }
  });
  return stream;
}

gulp.task('clean', () => del([
  '.tmp/*',
  'dist/**/*',
  'reports/**/*'
]));

// static: copy fonts
gulp.task('static:fonts', () => {
  return gulp.src(['public/fonts/**'])
    .pipe(gulp.dest('dist/fonts/'));
});

// static: copy images
gulp.task('static:images', () => {
  return gulp.src(['public/images/**'])
    .pipe(gulp.dest('dist/images/'));
});

// static: root resources
gulp.task('static:root', () => {
  return gulp.src([
    'public/*.html',
    'public/favicon.ico',
    'public/robots.txt'
    ])
    .pipe(gulp.dest('dist/'));
});

// static: all steps
gulp.task('static', gulp.parallel('static:fonts', 'static:images', 'static:root'));

// css: Compile CSS with PostCSS
gulp.task('css', () => {
  return gulp.src('public/styles/flex.css', { base: 'public' })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(postcss([
      cssImport({from: 'public/styles/flex.css'}),
      cssnext()]))
    .pipe(hash()) // Add hashes to the files' names
    .pipe(gulp.dest('dist'))
    .pipe(cssnano())
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('dist'))
    .pipe(hash.manifest('assets.json', hash_mf)) // Switch to the manifest file
    .pipe(gulp.dest('dist')) // Write the manifest file
    .pipe(plumber.stop());
});

// js: create template cache for partials
gulp.task('js:templates', () => {
  return gulp.src('public/templates/**/*.html')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(templateCache({
      standalone: true
    }))
    .pipe(print())
    .pipe(concat('js/templates.js'))
    .pipe(gulp.dest('dist'))
    .pipe(plumber.stop());
});

// js: Minify & uglify angular application
gulp.task('js:app', () => {
  return gulp.src('public/js/**/*.js')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(print())
    .pipe(babel())
    .pipe(concat('js/app.js'))
    .pipe(hash()) // Add hashes to the files' names
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(size({ gzip: true, showFiles: true }))
    .pipe(gulp.dest('dist'))
    .pipe(hash.manifest('assets.json', hash_mf)) // Switch to the manifest file
    .pipe(gulp.dest('dist')) // Write the manifest file
    .pipe(plumber.stop());
});

// js: collect and minify NPM dependencies
gulp.task('js:npm', () => {
  return gulp.src([
      'node_modules/angular/angular.js',
      'node_modules/angular-ios9-uiwebview-patch/angular-ios9-uiwebview-patch.js',
      'node_modules/marked/lib/marked.js',
      'node_modules/angular-marked/dist/angular-marked.js',
      'node_modules/angular-resource/angular-resource.js',
      'node_modules/angular-sanitize/angular-sanitize.js',
      'node_modules/angularjs-scroll-glue/src/scrollglue.js',
      'node_modules/angular-ui-router/release/angular-ui-router.js',
      'node_modules/angular-websocket/dist/angular-websocket.js'
    ])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(print())
    .pipe(concat('js/vendor.js'))
    .pipe(hash()) // Add hashes to the files' names
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(size({ gzip: true, showFiles: true }))
    .pipe(gulp.dest('dist'))
    .pipe(hash.manifest('assets.json', hash_mf)) // Switch to the manifest file
    .pipe(gulp.dest('dist')) // Write the manifest file
    .pipe(plumber.stop());
});

// js: straight copy, no transforming. Used for badly behaved things.
gulp.task('js:vendor',() => {
  return gulp.src(['vendor/**'])
    .pipe(gulp.dest('dist/js/'));
});

// js: all steps
gulp.task('js', gulp.parallel('js:app', 'js:npm', 'js:vendor', 'js:templates'));

// hash
gulp.task('hashref', () => {
  return gulp.src('dist/index.html')
    .pipe(hashReferences('dist/assets.json'))
    .pipe(gulp.dest('dist'));
});

// lint: css
gulp.task('lint:css', () => {
  return gulp.src('public/styles/*.css')
    .pipe(stylelint({
      failAfterError: true,
      reportOutputDir: 'reports/stylelint',
      reporters: [
        {formatter: 'verbose', console: true},
        {formatter: 'json', save: 'report.json'}
      ]
    }));
});

gulp.task('lint:js', () => {
  return gulp.src('public/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('lint:html', () => {
  let options = {
    reportpath: null,
    reportCheckstylePath: null,
    angular: true
  };
  return gulp.src('public/*.html')
    .pipe(validate(options));
});

gulp.task('lint:templates', () => {
  let options = {
    reportpath: null,
    reportCheckstylePath: null,
    tmplext: 'html',
    angular: true,
    customattrs: ['scroll-glue', 'marked'],
    customtags: ['profile-core'],
    relaxerror: [
      'Consider adding a “lang” attribute to the “html” start tag to declare the language of this document.'
    ],
  };
  return gulp.src('public/templates/**/*.html')
    .pipe(validate(options));
});

gulp.task('lint:infra', () => {
  return gulp.src([
    'test/js/**/*.js',
    'karma.conf.js',
    'gulpfile.babel.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// lint: all steps
gulp.task('lint',    gulp.series('lint:css', 'lint:js', 'lint:html', 'lint:templates', 'lint:infra'));

gulp.task('test', function(done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    browsers: ['PhantomJS']
  }, done).start();
});

gulp.task('build',   gulp.series(gulp.parallel('css','js','static'), 'hashref'));
gulp.task('default', gulp.series('clean', 'build'));
gulp.task('all',     gulp.series('clean', 'lint', 'test', 'build'));

// -- local dev/iteration

function server(done) {
  var names = {
    key: '.test-localhost-key.pem',
    cert: '.test-localhost-cert.pem',
  };
  var certs = {
    key: fs.readFileSync(names.key),
    cert: fs.readFileSync(names.cert),
  };
  bs = browserSync.create()
  bs.init({
    open: false,
    https: {
      key: names.key,
      cert: names.cert
    },
    server: {
      baseDir: 'dist'
    },
    callbacks: {
      /**
       * This 'ready' callback can be used
       * to access the Browsersync instance
       */
      ready: function(err, bs) {
        bs.addMiddleware('/auth/PublicCertificate', function (req, res) {
          res.end(Buffer.from(certs.cert));
        });

        bs.addMiddleware('/auth/DummyAuth', function (req, res) {
          var token = jwt.sign({
            name: 'username',
            id: 'dummy:pretend'
          }, certs.key, {
            expiresIn: '1h',
            algorithm: 'RS256'
          });

          res.writeHead(302, {
            location: '/#/login/callback/' + token
          });
          res.end();
        });

        bs.addMiddleware('/auth/RedHatAuth', function (req, res) {
          var token = jwt.sign({
            name: 'username',
            id: 'redhat:groupid:uniqueplayerid'
          }, certs.key, {
            expiresIn: '1h',
            algorithm: 'RS256'
          });

          res.writeHead(302, {
            location: '/#/login/callback/' + token
          });
          res.end();
        });

        bs.addMiddleware('/players/v1/accounts/undefined', function (req, res) {
          res.writeHead(404);
          res.end();
        });

        bs.addMiddleware('/players/v1/accounts/', function (req, res) {
          const body = JSON.stringify({
            "_id": "oauthProvider:userid",
            "name": "Harriet",
            "favoriteColor": "Tangerine",
            "location": {
              "location": "room_id_1"
            },
            "credentials": {
              "sharedSecret": "fjhre8h49hf438u9h45",
              "email": "myroomisbroken@gmail.com"
            }
          });

          res.writeHead(201, {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          });
          res.write(body);
          res.end();
        });
      }
    },
  });
  done();
}

function reload(done) {
  console.log('Reload browser');
  bs.exit();
  server(done);
}

const watchCss =     () => gulp.watch( 'public/styles/**/*',     gulp.series('build', reload));
const watchScripts = () => gulp.watch(['public/js/**/*',
                                       'public/templates/**/*'], gulp.series('build', reload));
const watchStatic =  () => gulp.watch(['public/images/**/*',
                                       'public/fonts/**/*',
                                       'public/*'],     gulp.series('build', reload));

// Development server with browsersync
gulp.task('serve', gulp.series('build', server, gulp.parallel(watchCss, watchScripts, watchStatic)));
