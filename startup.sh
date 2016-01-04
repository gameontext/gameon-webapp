#!/bin/bash

if [ "$ETCDCTL_ENDPOINT" != "" ]; then
  echo Setting up etcd...
  wget https://github.com/coreos/etcd/releases/download/v2.2.2/etcd-v2.2.2-linux-amd64.tar.gz -q
  tar xzf etcd-v2.2.2-linux-amd64.tar.gz etcd-v2.2.2-linux-amd64/etcdctl --strip-components=1
  rm etcd-v2.2.2-linux-amd64.tar.gz
  mv etcdctl /usr/local/bin/etcdctl

  echo Starting nginx in the background...
  nginx -c /etc/nginx/nginx.conf
  echo Starting the logstash forwarder...
  sed -i s/PLACEHOLDER_LOGHOST/$(etcdctl get /logstash/endpoint)/g /opt/forwarder.conf
  cd /opt
  chmod +x ./forwarder
  etcdctl get /logstash/cert > logstash-forwarder.crt
  etcdctl get /logstash/key > logstash-forwarder.key
  sleep 0.5
  ./forwarder --config ./forwarder.conf
else
  echo No logging host set. Running nginx to standard out...
  nginx -c /etc/nginx/nginx-nolog.conf
fi
