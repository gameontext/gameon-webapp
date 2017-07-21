FROM websphere-liberty:beta

LABEL maintainer="Erin Schnabel <schnabel@us.ibm.com> (@ebullientworks)"

#install common stuff game on uses..
RUN wget https://github.com/coreos/etcd/releases/download/v2.2.2/etcd-v2.2.2-linux-amd64.tar.gz -q && \
    tar xzf etcd-v2.2.2-linux-amd64.tar.gz etcd-v2.2.2-linux-amd64/etcdctl --strip-components=1 && \
    rm etcd-v2.2.2-linux-amd64.tar.gz && \
    mv etcdctl /usr/local/bin/etcdctl

#non interactive upgrade to update all pkgs to latest.
RUN apt-get update && apt-get install -y curl && DEBIAN_FRONTEND=noninteractive apt-get upgrade -y && apt-get clean && rm -Rf /var/cache/*

#update password rules as per bluemix vulnerability scan requirements.
RUN sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS   90/' /etc/login.defs
RUN sed -i 's/^PASS_MIN_DAYS.*/PASS_MIN_DAYS   1/' /etc/login.defs
RUN sed -i 's/sha512/sha512 minlen=8/' /etc/pam.d/common-password

# Install required features
RUN /opt/ibm/wlp/bin/installUtility install  --acceptLicense \
    apiDiscovery-1.0 \
    bluemixLogCollector-1.1 \
    cdi-1.2 \
    concurrent-1.0 \
    couchdb-1.0 \
    localConnector-1.0 \
    jaxrs-2.0 \
    jndi-1.0 \
    jsonp-1.0 \
    ssl-1.0 \
    websocket-1.1

# Add in a8
RUN wget -qO- https://github.com/amalgam8/amalgam8/releases/download/v0.4.2/a8sidecar.sh | sh
