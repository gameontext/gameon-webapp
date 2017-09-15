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

echo Launching nginx with  logging to standard out
nginx -c /etc/nginx/nginx-nolog.conf
