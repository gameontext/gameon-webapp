#!/bin/bash
PATH=$PATH:/app/node_modules/.bin

mkdir -p /app/node_modules/.home
HOME=/app/node_modules/.home

# Used when building inside a Docker image!
if [ ! -f /app/gulpfile.babel.js ]; then
    echo "You forgot to mount the volume, see README.md"
else
    cd /app

    echo $1
    if [ $# -lt 1 ]
    then
      ACTION=default
    else
      ACTION=$1
      shift
    fi

    if [ "$ACTION" == "cert" ] ||  [ ! -f /app/.test-localhost-cert.pem ]; then
      openssl req \
        -newkey rsa:2048 -x509 -nodes -keyout /app/.test-localhost-keytmp.pem \
        -new -out /app/.test-localhost-cert.pem \
        -subj /CN=localhost -reqexts SAN -extensions SAN \
        -config <(cat /etc/ssl/openssl.cnf <(printf '[SAN]\nsubjectAltName=DNS:localhost')) \
        -sha256 -days 3650

      openssl rsa -in /app/.test-localhost-keytmp.pem -out /app/.test-localhost-key.pem
      rm /app/.test-localhost-keytmp.pem
    fi
    if [ "$ACTION" == "cert" ]; then
      exit 0
    fi

    npm install
    npx gulp ${ACTION}
fi
