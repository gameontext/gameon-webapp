#!/bin/bash

if [ "$LOGGING_DOCKER_HOST" != "" ]; then
  echo Starting nginx in the background...
  nginx -c /etc/nginx/nginx.conf
  echo Starting the logstash forwarder...
  wget https://admin:$ADMIN_PASSWORD@game-on.org:8443/logstashneeds.tar -O /opt/logstashneeds.tar
  sed -i s/PLACEHOLDER_LOGHOST/$LOGGING_DOCKER_HOST/g /opt/forwarder.conf
  tar xvzf logstashneeds.tar ; rm logstashneeds.tar
  cd /opt ; chmod +x ./forwarder ; tar xvzf logstashneeds.tar ; rm logstashneeds.tar
  ./forwarder --config ./forwarder.conf
else
  echo No logging host set. Running nginx to standard out...
  nginx -c /etc/nginx/nginx-nolog.conf
fi
