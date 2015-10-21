FROM websphere-liberty:latest

MAINTAINER Ben Smith

COPY ./servers/gameon-player/* /opt/ibm/wlp/usr/servers/defaultServer/
COPY ./servers/gameon-player/resources/security/* /opt/ibm/wlp/usr/servers/defaultServer/resources/security/
COPY ./servers/gameon-player/apps/player-app-1.0.war /opt/ibm/wlp/usr/servers/defaultServer/apps/player-app.war

RUN /opt/ibm/wlp/bin/featureManager install mongodb-2.0 --acceptLicense

CMD ["/opt/ibm/wlp/bin/server", "run", "defaultServer"]