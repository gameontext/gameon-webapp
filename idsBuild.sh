#!/bin/bash

#
# This script is only intended to run in the IBM DevOps Services Pipeline Environment.
#

# To use Node.js 6.7.0, uncomment the following line:
export PATH=/opt/IBM/node-v6.7.0/bin:$PATH

cd app
npm install
./node_modules/.bin/bower install
./node_modules/.bin/grunt build
./node_modules/.bin/grunt test
