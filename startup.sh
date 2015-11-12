#!/bin/bash

cd /opt/frontend
echo "Starting the node server"
node server.js &
echo Running Logstash Forwarder...
sed -i s/PLACEHOLDER_LOGHOST/$LOGGING_DOCKER_HOST/g /opt/forwarder.conf
cd /opt ; ./forwarder --config ./forwarder.conf