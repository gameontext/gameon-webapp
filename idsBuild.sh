#!/bin/bash

#
# This script is only intended to run in the IBM DevOps Services Pipeline Environment.
#

echo Informing slack...
curl -X 'POST' --silent --data-binary '{"text":"A new build for the web application has started."}' $WEBHOOK > /dev/null

echo Installing bower and its dependencies...
cd src
npm install bower@1.5.3
node_modules/.bin/bower install
cd ..

mkdir dockercfg ; cd dockercfg
echo Downloading Docker requirements..
wget --user=admin --password=$ADMIN_PASSWORD https://$BUILD_DOCKER_HOST:8443/dockerneeds.tar -q
echo Setting up Docker...
wget http://security.ubuntu.com/ubuntu/pool/main/a/apparmor/libapparmor1_2.8.95~2430-0ubuntu5.3_amd64.deb -O libapparmor.deb
sudo dpkg -i libapparmor.deb
tar xzf dockerneeds.tar ; mv docker ../ ; cd .. ; chmod +x docker ; \
	export DOCKER_HOST="tcp://$BUILD_DOCKER_HOST:2376" DOCKER_TLS_VERIFY=1 DOCKER_CONFIG=./dockercfg

echo Building the docker image...
sed -i s/PLACEHOLDER_ADMIN_PASSWORD/$ADMIN_PASSWORD/g ./Dockerfile
./docker build -t gameon-webapp .
echo Stopping the existing container...
./docker stop -t 0 gameon-webapp || true
./docker rm gameon-webapp || true
echo Starting the new container...
./docker run -d -p 8080:8080 -e LOGGING_DOCKER_HOST=$LOGGING_DOCKER_HOST -e ADMIN_PASSWORD=$ADMIN_PASSWORD --name=gameon-webapp gameon-webapp
echo Removing non-artifacts...
rm docker ; rm -rf dockercfg