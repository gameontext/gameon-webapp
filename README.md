# Game On! 

Game On! is a both a sample application, and throwback text adventure.

VERY MUCH a work in progress

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.12.1.

## Prereq

* gradle v2.7
* node.js v4.2.0

For the overall gradle build to run, you do need gradle, and we do need node for the
client side build/test workflow.

## Build & development

### JavaScript client (in player-app): 

* `gradle npmInstall` to install npm if you don't have it already
* `gradle bowerInstall` will make sure you have bower and related project dependencies ready to go
  * This will include setting up development dependencies like grunt, see https://github.com/WASdev/gameon-player/blob/master/player-app/package.json
* Use `grunt` for building the JavaScript client
  * Use `grunt serve` for preview, or
  * Use Liberty in WDT to view/edit JS and JavaScript live at the same time 

Full E2E build isn't there yet.. coming. ;)

### Java application: 

Run live in WDT
Run `gradle build` to build the final server package for deployment.

## Testing

Running `grunt test` will run the unit tests with karma.

Gradle integration should mean running e2e tests for JS and Java app in one go (not there yet)

## Docker

To build a Docker image for this app/service, execute the following:

```
gradle buildImage
```

Or, if you don't have gradle, then:

```
./gradlew buildImage
```

### Interactive Run

```
docker run -it -p 9443:9443 -e LICENSE=accept gameon-player bash
```

Then, you can start the server with 
```
/opt/ibm/wlp/bin/server run defaultServer
```

### Daemon Run

```
docker run -d -p 9443:9443 -e LICENSE=accept -e DOCKER_CONCIERGE_URL=http://game-on.org:9081/concierge --name gameon-player gameon-player
```

### Stop

```
docker stop gameon-player ; docker rm gameon-player
```

### Restart Daemon

```
docker stop gameon-player ; docker rm gameon-player; docker run -d -p 9443:9443 -e LICENSE=accept --name gameon-player gameon-player
```


## TODO

- [ ] OAuth2
- [ ] Karma/Jasmine tests
- [ ] Make sure build gradle runs the whole show and builds the final war in the right order



Mebbe
- [ ] Maybe switch from grunt to gulp (see syntax behavior diffs)
