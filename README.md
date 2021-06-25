# Game On! Web Frontend

[![Codacy Badge](https://api.codacy.com/project/badge/grade/97dba9bf5a944578b56831a974f225fa)](https://www.codacy.com/app/gameontext/gameon-webapp)

Check out our [core system architecture](https://book.gameontext.org/microservices/) to see how the "webapp" service fits.

## Contributing

Want to help! Pile On! 

[Contributing to Game On!](https://github.com/gameontext/gameon/blob/main/CONTRIBUTING.md)

## Building and testing the web front end 

* [Build Natively](#natively)
* [Build in a Container](#in-a-container)
* [Build as a submodule from the gameon project](#build-using-docker-compose-from-the-gameon-project)

The build requires node 6, and uses Gulp to manage builds, and Karma with PhantomJS to run tests.

Gulp tasks:

* **all** (clean, lint, test, build)
* **build** (css, js, static, hashref) -- create production-ready content in the dist dir
* **clean** -- clean the dist dir and other related working files
* css -- postcss-based processing and concatenation of css, followed by minify and hash
* **default** (clean, build)
* hashref -- replaces references to files in index.html with hashed equivalent
* js --  concatenate, minify, and hash javascript
  - js:app -- concatenate and minify angular application
  - js:npm -- concatenate and minify vendor scripts from npm (angluar lib, etc.)
  - js:templates -- generate js module for cached angular templates
  - js:vendor -- concatenate and minify downloaded/checked in scripts (jsrsasign, which misbehaves when pulled from npm)
* lint (lint:css, lint:js, 'lint:html', 'lint:templates', 'lint:infra')
  - lint:css -- run css linter (stylelintrc)
  - lint:js -- run js linter (jshint)
  - lint:html -- run html linter on static files (html-angular-validator)
  - lint:infra -- lint infrastructure files (tests, karma, gulp)
  - lint:templates --  run angular-aware linter on templates (html-angular-validator with angular options)
* serve -- build, load in a browser, and watch for changes
* static -- copy static resources
  - static:fonts -- copy checked-in fonts
  - static:images -- copy images
  - static:root -- copy root resources (*.html, *.ico, ... )
* **test** -- run tests using karma (with PhantomJS)

### Natively

The build requires node 6, and uses Gulp to manage builds, and Karma with PhantomJS to run tests.

```bash
$ cd app
$ npm install
$ $(npm bin)/gulp build
```

### In a Container!

If you don't have (or don't want!) node, Gulp, and/or PhantomJS installed (or if PhantomJS is just being a pain), don't worry, we have you covered! The image created by `Dockerfile-node` contains everything you need to build and unit test the web front end.

TL;DR: Use the `build.sh` script, with the following actions:
  
  - `build` -- build the webapp, `gulp build`
  - `cert`  -- create a test ssl certificate
  - `shell` -- open a shell for iterative development (allows running any of the above gulp tasks)
  - `test`  -- test the webapp using `gulp test`, see [below](#running-tests)  
  - `final` -- build the final docker container (after running `build`)
  - `tools` -- create or recreate the docker tools image and dependency volume

**Note:** if you see an error like `setrlimit `RLIMIT_NOFILE`: Operation not permitted` on Linux, then you need to raise your file handle limit. How to do this varies by distribution, as the configuration value is kept in /etc/security/limits.conf, /etc/systemd/user.conf and /etc/systemd/system.conf (or some subset, or combination, depending on how the system is configured).

### Build using Docker Compose (from the gameon project)

If you're building from the top-level `gameon` project with docker-compose, copy the following from `docker/docker-compose.override.yml.example` into `docker/docker-compose.override.yml`:

```bash
services:
  webapp:
    build:
      context: ../webapp
    volumes:
      - '../webapp/app/dist:/opt/www/public'
```

After that, use `docker/go-run.sh` to manage rebuilding and starting the web front-end:

```bash
./docker/go-run.sh rebuild webapp
```

## Running tests

By default, we use Karma with PhantomJS for unit testing:

```bash
$ cd app
$ $(npm bin)/gulp test
```

The image used for building has phantomjs within it. If you want to run tests natively, it's up to you to install PhantomJS in whatever way suits you best.

## Live development with BrowserSync

```bash
$ ./build.sh cert  # generate the test certificate
$ cd app
$ $(npm bin)/gulp serve
```
