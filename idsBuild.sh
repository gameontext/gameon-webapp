#!/bin/bash

#
# This script is only intended to run in the IBM DevOps Services Pipeline Environment.
#

echo Informing slack...
curl -X 'POST' --silent --data-binary '{"text":"A new build for the web application has started."}' $WEBHOOK > /dev/null
echo Downloading the Docker binary from game-on.org...
wget http://game-on.org:8081/docker -O ./docker -q
chmod +x docker
export DOCKER_HOST="tcp://game-on.org:2375"
echo Building the docker image...
./docker build -t gameon-webapp .
echo Stopping the existing container...
./docker stop -t 0 gameon-webapp || true
./docker rm gameon-frontend || true
echo Starting the new container...
./docker run -d -p 3000:3000 --name=gameon-webapp gameon-webapp