#!/bin/bash

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

    npm install
    gulp ${ACTION}
fi
