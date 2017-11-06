# Game On! Web Frontend

[![Codacy Badge](https://api.codacy.com/project/badge/grade/97dba9bf5a944578b56831a974f225fa)](https://www.codacy.com/app/gameontext/gameon-webapp)

Check out our [core system architecture](https://book.gameontext.org/microservices/) to see how the "webapp" service fits.

## Contributing

Want to help! Pile On! 

[Contributing to Game On!](https://github.com/gameontext/gameon/blob/master/CONTRIBUTING.md)

## Building and testing the web front end 

* [Build Natively](#natively)
* [Build in a Container](#in-a-container)
* [Build as a submodule from the gameon project](#build-using-docker-compose-from-the-gameon-project)

### Natively 

The build requires node 6, and uses grunt and bower to manage builds.

```
$ cd app
$ npm install
$ bower install
$ grunt build
```

### In a Container! 

If you don't have (or don't want!) node, bower and/or grunt installed, don't worry, we have you covered! The image created by `Dockerfile-node` contains everything you need to build and unit test the web front end.

There are two ways to work with this container: 

1. Issue docker commands directly: 
  - create a volume for node_modules (this prevents conflicts if you switch between native and docker-based builds): 
    ```
    docker volume create --name webapp-node-modules
    ```

  - create the image: 
    ```
    docker build -f Dockerfile-node -t webapp-build .
    ```

  - To build the web application, use: 
    ```
    docker run --rm -it -v $PWD/app:/app -v webapp-node-modules:/app/node_modules webapp-build docker-build.sh
    ```
    Note the extra volume for node_modules. This is necessary if you also build locally. Some dependencies (like prebuilt phantomjs on a mac) will tank a container-based build. This second volume allows the two systems to coexist without confusing each other.

  - To open a shell: 
    ```
    docker run --rm -it -v $PWD/app:/app -v webapp-node-modules:/app/node_modules webapp-build /bin/bash
    ```

  - To test: 
    ```
    docker run --rm -it -v $PWD/app:/app -v webapp-node-modules:/app/node_modules webapp-build docker-build.sh test
    ```

  - create the final image: 
    ```
    docker build -t gameontext/webapp .
    ```

2. Did all of that seem like a lot? Then use the `build.sh` script instead, with the following actions:
  
  - `build` -- build the webapp (performs steps above, but inside a container)
  - `shell` -- open a shell for iterative development
  - `test`  -- test the webapp using `grunt test`, see [below](#running-tests) 

### Build using Docker Compose (from the gameon project)

If you're building from the top-level `gameon` project with docker-compose, copy the following from `docker/docker-compose.override.yml.example` into `docker/docker-compose.override.yml`: 

```
services:
  webapp-build:
    build:
      context: ../webapp
      dockerfile: Dockerfile-node
    command: /usr/local/bin/docker-build.sh
    volumes:
      - '../webapp/app:/app'
      - 'webapp-node-modules:/app/node_modules'

  webapp:
    build:
      context: ../webapp
    volumes:
      - '../webapp/app:/opt/www'

volumes:
  webapp-node-modules:
    external: true
```

After that, use `docker/go-run.sh` to manage rebuilding and starting the web front-end: 
```
./docker/go-run.sh rebuild webapp
```

## Running tests

By default, we use Karma with PhantomJS for unit testing: 

```
$ cd app
$ grunt test
```

The image used for building has phantomjs within it. If you want to run tests natively, it's up to you to install PhantomJS in whatever way suits you best.

## Sniff test of the server with express

To check the look and feel, you can start a quick node server. It's utility is
limited, you'll get better results by [running the webapp using Docker Compose from the gameon project](#build-using-docker-compose-from-the-gameon-project) )

### To create or replace the local certificate you need for sniff-test

```
$ cd app
$ openssl genrsa -out test-localhost.key 2048
$ openssl req -new -x509 -key test-localhost.key -out test-localhost.cert -days 3650 -subj /CN=localhost
```

(https://www.kevinleary.net/self-signed-trusted-certificates-node-js-express-js/, and many others)

### To start the server for the sniff test: 

```
$ cd app
$ node test-server.js
```
