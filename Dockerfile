FROM    node:0.10

MAINTAINER Ben Smith (benjsmi@us.ibm.com)

ADD http://game-on.org:8081/logstash-2.0.0.tar.gz /opt/
ADD http://game-on.org:8081/jdk-8u65-x64.tar.gz /opt/

RUN mkdir -p /opt/frontend
COPY ./src/ /opt/frontend/

RUN cd /opt ; echo "Extract Java..." ; tar xzf jdk-8u65-x64.tar.gz ; \
	echo "Extract Logstash..." ; tar xzf logstash-*.tar.gz ; \
	echo "Cleanup..." ; rm logstash-*.tar.gz jdk-8u65-x64.tar.gz ; \
	echo "Installing Node modules..." ; cd /opt/frontend ; npm install ; \
	echo "Installing Bower modules..." ; node_modules/.bin/bower install --allow-root 

COPY ./logstash/logstash.conf /opt/logstash-2.0.0/
COPY ./startup.sh /opt/startup.sh

EXPOSE 3000

CMD ["/opt/startup.sh"]