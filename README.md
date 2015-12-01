# Game On! Web Webapp

[![Codacy Badge](https://api.codacy.com/project/badge/grade/97dba9bf5a944578b56831a974f225fa)](https://www.codacy.com/app/gameontext/gameon-webapp)

This project contains just the JavaScript web application (no services).

## Docker

### Building

```
docker build -t gameon-webapp
```

### Interactive Run

```
docker run -it -P --name gameon-webapp gameon-webapp bash
```

### Daemon Run

```
docker run -d -P --name gameon-webapp gameon-webapp
```

### Stop

```
docker stop gameon-player ; docker rm gameon-player
```

### Restart Daemon

```
docker stop gameon-player ; docker rm gameon-player ; docker run -d -P --name gameon-webapp gameon-webapp
```

### Usage

Web Application is then available from `http://DOCKER_HOST:8080`.
