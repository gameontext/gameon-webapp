FROM websphere-liberty:latest

MAINTAINER Ben Smith

ADD ./servers/gameon-player /opt/ibm/wlp/usr/servers/defaultServer/
RUN rm /opt/ibm/wlp/usr/servers/defaultServer/server.env
COPY ./oauth-credentials.xml /opt/ibm/wlp/usr/servers/defaultServer/configDropins/overrides/

RUN /opt/ibm/wlp/bin/featureManager install mongodb-2.0 --acceptLicense

CMD ["/opt/ibm/wlp/bin/server", "run", "defaultServer"]