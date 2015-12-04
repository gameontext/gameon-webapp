#!/bin/bash

if [ "$LOGSTASH_ENDPOINT" != "" ]; then
  echo Starting nginx in the background...
  nginx -c /etc/nginx/nginx.conf
  echo Starting the logstash forwarder...
  sed -i s/PLACEHOLDER_LOGHOST/$LOGSTASH_ENDPOINT/g /opt/forwarder.conf
  cd /opt
  chmod +x ./forwarder
  echo -e $LOGSTASH_CERT > logstash-forwarder.crt
  echo -e $LOGSTASH_KEY > logstash-forwarder.key
  sleep 0.5
  ./forwarder --config ./forwarder.conf
else
  echo No logging host set. Running nginx to standard out...
  nginx -c /etc/nginx/nginx-nolog.conf
fi
