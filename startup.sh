#!/bin/bash

echo Starting nginx in the background...
nginx -c /etc/nginx/nginx.conf
echo Starting the logstash forwarder...
sed -i s/PLACEHOLDER_LOGHOST/$LOGGING_DOCKER_HOST/g /opt/forwarder.conf
cd /opt ; ./forwarder --config ./forwarder.conf