#!/bin/bash

cd /opt/frontend
echo "Starting the node server"
node server.js &
echo Running Logstash Forwarder...
cd /opt ; ./forwarder --config ./forwarder.conf