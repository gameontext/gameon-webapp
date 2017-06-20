#!/bin/bash

# Used when building inside a Docker image!
if [ -f /app/bower.json ]; then
    echo "You forgot to mount the volume, see README.md"
else
    cd /app

    npm install
    grunt build
fi
