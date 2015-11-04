FROM    node:0.10

MAINTAINER Ben Smith (benjsmi@us.ibm.com)

RUN mkdir -p /opt/frontend
COPY ./src/ /opt/frontend/
RUN cd /opt/frontend ; npm install ; node_modules/.bin/bower install --allow-root 

EXPOSE 3000

CMD ["/opt/frontend/startup.sh"]