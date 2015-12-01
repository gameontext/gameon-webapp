#!/bin/bash

if [ "$LOGGING_DOCKER_HOST" != "" ]; then
  echo Starting nginx in the background...
  nginx -c /etc/nginx/nginx.conf
  echo Starting the logstash forwarder...
  sed -i s/PLACEHOLDER_LOGHOST/$LOGGING_DOCKER_HOST/g /opt/forwarder.conf
  cd /opt ; ./forwarder --config ./forwarder.conf
else
  echo No logging host set. Running nginx to standard out...
  nginx -c /etc/nginx/nginx-nolog.conf
fi
