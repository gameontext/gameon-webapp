#!/bin/bash

#
# This script is only intended to run in the IBM DevOps Services Pipeline Environment.
#

echo Informing slack...
curl -X 'POST' --silent --data-binary '{"text":"A new build for the web application has started."}' $SLACK_WEBHOOK_PATH > /dev/null

echo Setting up Docker...
mkdir dockercfg ; cd dockercfg
echo -e $KEY > key.pem
echo -e $CA_CERT > ca.pem
echo -e $CERT > cert.pem
cd ..
wget http://security.ubuntu.com/ubuntu/pool/main/a/apparmor/libapparmor1_2.8.95~2430-0ubuntu5.3_amd64.deb -O libapparmor.deb
sudo dpkg -i libapparmor.deb
rm libapparmor.deb
wget https://get.docker.com/builds/Linux/x86_64/docker-1.9.1 --quiet -O docker
chmod +x docker

echo Building projects using gradle...
./docker build -t gameon-webapp .
if [ $? != 0 ]
then
  echo "Docker build failed, will NOT attempt to stop/rm/start-new-container."
  curl -X 'POST' --silent --data-binary '{"text":"Docker Build for the webapp service has failed."}' $SLACK_WEBHOOK_PATH > /dev/null
  exit -2
else
  echo Attempting to remove old containers.
  ./docker stop -t 0 gameon-webapp || true
  ./docker rm gameon-webapp || true
  echo Starting new container.
  ./docker run -d -p 8080:8080 --restart=always --link=etcd -e ETCDCTL_ENDPOINT=http://etcd:4001 --name=gameon-webapp gameon-webapp
  if [ $? != 0 ]
  then
    echo "Docker run failed.. it's too late.. the damage is done already."
    curl -X 'POST' --silent --data-binary '{"text":"Docker Run for the webapp service has failed."}' $SLACK_WEBHOOK_PATH > /dev/null
    exit -3
  else
    cd ..
    rm -rf dockercfg
  fi
fi

echo Removing non-artifacts...

rm docker ; rm -rf dockercfg
