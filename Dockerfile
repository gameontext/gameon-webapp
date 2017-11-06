FROM nginx

LABEL maintainer="Erin Schnabel <schnabel@us.ibm.com> (@ebullientworks)"

ENV ETCD_VERSION 2.2.2

RUN apt-get update \
  && apt-get install -y \
     curl \
     procps \
     wget \
  && rm -rf /var/lib/apt/lists/* \
  && wget https://github.com/coreos/etcd/releases/download/v${ETCD_VERSION}/etcd-v${ETCD_VERSION}-linux-amd64.tar.gz -q \
  && tar xzf etcd-v${ETCD_VERSION}-linux-amd64.tar.gz etcd-v${ETCD_VERSION}-linux-amd64/etcdctl --strip-components=1 \
  && rm etcd-v${ETCD_VERSION}-linux-amd64.tar.gz \
  && mv etcdctl /usr/local/bin/etcdctl

COPY docker/nginx.conf        /etc/nginx/nginx.conf
COPY docker/nginx-common.conf /etc/nginx/nginx-common.conf
COPY docker/nginx-nolog.conf  /etc/nginx/nginx-nolog.conf
COPY docker/startup.sh        /opt/startup.sh
COPY docker/forwarder.conf    /opt/forwarder.conf

ADD app/dist/ /opt/www

EXPOSE 8080

CMD ["/opt/startup.sh"]

HEALTHCHECK \
  --timeout=10s \
  --start-period=40s \
  CMD wget -q -O /dev/null http://localhost:8080/health
