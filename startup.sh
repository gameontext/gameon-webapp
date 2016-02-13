#!/bin/bash

if [ "$ETCDCTL_ENDPOINT" != "" ]; then
  echo Setting up etcd...
  echo "** Testing etcd is accessible"
  etcdctl --debug ls
  RC=$?

  while [ $RC -ne 0 ]; do
    sleep 15
    # recheck condition
    echo "** Re-testing etcd connection"
    etcdctl --debug ls
    RC=$?
  done
  echo "etcdctl returned sucessfully, continuing"

  export LOGSTASH_ENDPOINT=$(etcdctl get /logstash/endpoint)

  # Softlayer needs a logstash endpoint so we set up the server
  # to run in the background and the primary task is running the
  # forwarder. In ICS, Liberty is the primary task so we need to
  # run it in the foreground
  if [ "$LOGSTASH_ENDPOINT" != "" ]; then
    echo Starting nginx in the background...
    nginx -c /etc/nginx/nginx.conf
    echo Starting the logstash forwarder...
    sed -i s/PLACEHOLDER_LOGHOST/${LOGSTASH_ENDPOINT}/g /opt/forwarder.conf
    cd /opt
    chmod +x ./forwarder
    etcdctl get /logstash/cert > logstash-forwarder.crt
    etcdctl get /logstash/key > logstash-forwarder.key
    sleep 0.5
    ./forwarder --config ./forwarder.conf
  else
    echo Launching nginx with  logging to standard out
    nginx -c /etc/nginx/nginx-nolog.conf
  fi
else
  echo No logging host set. Running nginx to standard out...
  nginx -c /etc/nginx/nginx-nolog.conf
fi
