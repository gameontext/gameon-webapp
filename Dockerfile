FROM    node:0.10

MAINTAINER Ben Smith (benjsmi@us.ibm.com)

RUN mkdir -p /opt/frontend
COPY ./src/ /opt/frontend/

RUN echo "Installing Node modules..." ; cd /opt/frontend ; npm install ; \
	echo "Installing Bower modules..." ; node_modules/.bin/bower install --allow-root 

ADD https://download.elastic.co/beats/filebeat/filebeat-1.0.0-rc1-x86_64.tar.gz /opt/filebeat.tar.gz

RUN cd /opt ; tar xzf filebeat.tar.gz

COPY ./filebeat.yml /opt/filebeat-1.0.0-rc1-x86_64/filebeat.yml
COPY ./startup.sh /opt/startup.sh

EXPOSE 3000

CMD ["/opt/startup.sh"]