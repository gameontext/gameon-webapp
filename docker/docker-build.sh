#!/bin/bash

# Used when building inside a Docker image!
if [ ! -f /app/bower.json ]; then
    echo "You forgot to mount the volume, see README.md"
else
    cd /app

echo $1
    if [ $# -lt 1 ]
    then
      ACTION=build
    else
      ACTION=$1
      shift
    fi

    npm install
    ./node_modules/.bin/bower install --allow-root
    grunt ${ACTION}
fi
