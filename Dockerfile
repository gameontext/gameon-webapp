FROM nginx

MAINTAINER Ben Smith

ADD https://download.elastic.co/logstash-forwarder/binaries/logstash-forwarder_linux_amd64 /opt/forwarder
ADD https://admin:PLACEHOLDER_ADMIN_PASSWORD@game-on.org:8443/logstashneeds.tar /opt/logstashneeds.tar

RUN cd /opt ; chmod +x ./forwarder ; tar xvzf logstashneeds.tar ; rm logstashneeds.tar

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./startup.sh /opt/startup.sh
COPY ./forwarder.conf /opt/forwarder.conf

EXPOSE 8080

CMD ["/opt/startup.sh"]

ADD ./src/public/ /opt/www/
