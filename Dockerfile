FROM    node:0.10

MAINTAINER Ben Smith (benjsmi@us.ibm.com)

RUN mkdir -p /opt/frontend
COPY ./src/ /opt/frontend/

RUN echo "Installing Node modules..." ; cd /opt/frontend ; npm install ; \
	echo "Installing Bower modules..." ; node_modules/.bin/bower install --allow-root 

COPY ./startup.sh /opt/startup.sh

EXPOSE 3000

CMD ["/opt/startup.sh"]