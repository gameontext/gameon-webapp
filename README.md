# Game On! Webapp Service

[![Codacy Badge](https://api.codacy.com/project/badge/grade/97dba9bf5a944578b56831a974f225fa)](https://www.codacy.com/app/gameontext/gameon-webapp)

See the Swagger service [information page](https://gameontext.gitbooks.io/gameon-gitbook/content/microservices/webapp.html) in the Game On! Docs for more information on how to use this service.

## Contributing

Want to help! Pile On! 

[Contributing to Game On!](https://github.com/gameontext/gameon/blob/master/CONTRIBUTING.md)

## Building and testing the web front end 

### Natively 

The build requires node 6, and uses grunt and bower to manage builds.

```
npm install
bower install
grunt build
```

### In a Container! 

If you don't have (or don't want!) node, bower and/or grunt installed, don't worry! We have you covered! The image created by `Dockerfile-node` contains everything you need to build and unit test the web front end.

* Use `build.sh` to build and test the front end. Operations are: 
  - `build` -- build the webapp (performs steps above)
  - `shell` -- open a shell for iterative development
  - `test`  -- test the webapp using `grunt test`, see [below](#running-tests)
  - 
* Issue docker commands directly: 
  - create a volume for node_modules (this prevents conflicts if you switch between native and docker-based builds): 
    ```
    docker volume create --name webapp-node-modules
    ```
  - create the image for building: 
    ```
    docker build -f Dockerfile-node -t webapp-build .
    ```
  - To build, use: 
    ```
    docker run --rm -it -v $PWD/app:/app -v webapp-node-modules:/app/node_modules webapp-build docker-build.sh
    ```
  - To open a shell: 
    ```
    docker run --rm -it -v $PWD/app:/app -v webapp-node-modules:/app/node_modules webapp-build /bin/bash
    ```
  - To test: 
    ```
    docker run --rm -it -v $PWD/app:/app -v webapp-node-modules:/app/node_modules webapp-build docker-build.sh test
    ```

## From the top-level `gameon` project (submodules)

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

After that, use `docker-compose` via `docker/go-run.sh` to manage building and rebuilding the web front-end: 
```
./docker/go-run.sh rebuild webapp
```

## Running tests

By default, we use Karma with PhantomJS for unit testing: 

```
grunt test
```

The image used for building has phantomjs within it. If you want to run tests natively, it's up to you to install PhantomJS in whatever way suits you best.
