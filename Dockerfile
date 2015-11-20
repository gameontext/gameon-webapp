FROM    node:0.10

MAINTAINER Ben Smith (benjsmi@us.ibm.com)

ADD https://download.elastic.co/logstash-forwarder/binaries/logstash-forwarder_linux_amd64 /opt/forwarder
ADD https://admin:admin@game-on.org:8443/logstashneeds.tar /opt/logstashneeds.tar

RUN mkdir -p /opt/frontend
COPY ./src/ /opt/frontend/

RUN cd /opt ; chmod +x ./forwarder ; tar xvzf logstashneeds.tar ; rm logstashneeds.tar ; \
	echo "Installing Node modules..." ; cd /opt/frontend ; npm install ; \
	echo "Installing Bower modules..." ; node_modules/.bin/bower install --allow-root 

COPY ./forwarder.conf /opt/forwarder.conf
COPY ./startup.sh /opt/startup.sh

EXPOSE 3000

CMD ["/opt/startup.sh"]