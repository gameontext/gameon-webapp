FROM nginx

MAINTAINER Ben Smith

ADD https://download.elastic.co/logstash-forwarder/binaries/logstash-forwarder_linux_amd64 /opt/forwarder
RUN apt-get update ; apt-get install -y wget
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./nginx-nolog.conf /etc/nginx/nginx-nolog.conf
COPY ./startup.sh /opt/startup.sh
COPY ./forwarder.conf /opt/forwarder.conf

EXPOSE 8080

CMD ["/opt/startup.sh"]

ADD ./src/public/ /opt/www/
