#!/bin/bash

# Configure our link to etcd based on shared volume with secret
if [ ! -z "$ETCD_SECRET" ]; then
  echo "Configuring for secure etcd"
  . /data/primordial/setup.etcd.sh /data/primordial $ETCD_SECRET
else
  echo "Using local env for any etcd"
fi

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
else
  #local environment, no logstash to use.
  echo -n "Making sure application has been built .. "
  if [ ! -d /opt/www/public/bower_components ]; then
    echo ".. bower components are missing. The application was not built before packaging."
    exit 1
  else
    echo ".. all is well."
  fi
fi

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
  echo No logging host set. Running nginx to standard out...
  echo Launching nginx with  logging to standard out
  nginx -c /etc/nginx/nginx-nolog.conf
fi
