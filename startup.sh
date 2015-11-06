#!/bin/bash

cd /opt/frontend
echo "Starting the node server"
node server.js &
echo Running logstash...
export JAVA_HOME=/opt/jdk1.8.0_65/
/opt/logstash-2.0.0/bin/logstash -f /opt/logstash-2.0.0/logstash.conf
