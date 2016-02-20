FROM nginx

MAINTAINER Ben Smith

ADD https://download.elastic.co/logstash-forwarder/binaries/logstash-forwarder_linux_amd64 /opt/forwarder
#
# npm and git needed for bower; see below.
#
RUN apt-get update ; apt-get install -y wget npm git ; ln -s /usr/bin/nodejs /usr/bin/node
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./nginx-nolog.conf /etc/nginx/nginx-nolog.conf
COPY ./startup.sh /opt/startup.sh
COPY ./forwarder.conf /opt/forwarder.conf
RUN wget https://github.com/coreos/etcd/releases/download/v2.2.2/etcd-v2.2.2-linux-amd64.tar.gz -q ; \
    tar xzf etcd-v2.2.2-linux-amd64.tar.gz etcd-v2.2.2-linux-amd64/etcdctl --strip-components=1 ; \
    rm etcd-v2.2.2-linux-amd64.tar.gz ; \
    mv etcdctl /usr/local/bin/etcdctl

EXPOSE 8080

CMD ["/opt/startup.sh"]

ADD ./dist/ /opt/www

#
# And in fact, we do need to build the bower components into the image and not build them locally, so
# there's a lot of mess inside the container that in the end prolly isn't needed.
#
RUN cd /opt/www ; npm install bower@1.5.3 ; node_modules/.bin/bower install --allow-root
