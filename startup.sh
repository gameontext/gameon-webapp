#!/bin/bash

cd /opt/frontend
echo "Starting the node server"
node server.js &
echo Running filebeat...
sed -i s/PLACEHOLDER_DOCKERHOST/$LOGGING_DOCKER_HOST/g /opt/filebeat-1.0.0-rc1-x86_64/filebeat.yml
/opt/filebeat-1.0.0-rc1-x86_64/filebeat -e -c /opt/filebeat-1.0.0-rc1-x86_64/filebeat.yml