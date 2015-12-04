# Game On! Web Webapp

[![Codacy Badge](https://api.codacy.com/project/badge/grade/97dba9bf5a944578b56831a974f225fa)](https://www.codacy.com/app/gameontext/gameon-webapp)

This project contains just the JavaScript web application (no services).

## Docker

### Environment Variables

* `LOGSTASH_ENDPOINT`: The Logstash Lumberjack endpoint to forward logs to. 

### Building

```
docker build -t gameon-webapp .
```

### Interactive Run

```
docker run -it -p 8080:8080 --name gameon-webapp gameon-webapp bash
```

### Daemon Run

```
docker run -d -p 8080:8080 --name gameon-webapp gameon-webapp
```

### Stop

```
docker stop gameon-webapp ; docker rm gameon-webapp
```

### Restart Daemon

```
docker stop gameon-webapp ; docker rm gameon-webapp ; docker run -d -p 8080:8080 --name gameon-webapp gameon-webapp
```

### Usage

Web Application is then available from `http://DOCKER_HOST:8080`.
