# Game On! Webapp Service

[![Codacy Badge](https://api.codacy.com/project/badge/grade/97dba9bf5a944578b56831a974f225fa)](https://www.codacy.com/app/gameontext/gameon-webapp)

See the Swagger service [information page](https://gameontext.gitbooks.io/gameon-gitbook/content/microservices/webapp.html) in the Game On! Docs for more information on how to use this service.

## Contributing

Want to help! Pile On! 

[Contributing to Game On!](https://github.com/gameontext/gameon/blob/master/CONTRIBUTING.md)

## Building and testing the web front end 

The build requires node 6, and uses grunt and bower to manage builds.

```
npm install
bower install
grunt build
```

If you don't have these installed, don't worry! We have you covered! 

* From the webapp project itself, create a docker image for building:  
  ```
  docker build -f Dockerfile-node -t webapp-build .
  ```
  
  Then, to build, run: 
  ```
  docker run --rm -it -v $PWD/app:/app webapp-build /usr/local/bin/local-build.sh
  ```
  To open a shell: 
  ```
  docker run --rm -it -v $PWD/app:/app webapp-build /bin/bash
  ```
  

* If you're building from the top-level `gameon` project with docker-compose, copy the following from `docker/docker-compose.override.yml.example` into `docker/docker-compose.override.yml`: 
  ```
  webapp-build:
    build:
       context: ../webapp
       dockerfile: Dockerfile-node
    command: /usr/local/bin/docker-build.sh
    volumes:
      - './webapp/app:/app'

  webapp:
    build:
      context: ../webapp
    volumes:
      - './webapp/app:/opt/www'
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
