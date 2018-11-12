FROM nginx:stable-alpine

LABEL maintainer="Erin Schnabel <schnabel@us.ibm.com> (@ebullientworks)"

COPY docker/nginx.conf        /etc/nginx/nginx.conf
COPY docker/startup.sh        /opt/startup.sh

COPY app/dist/ /opt/www/public

EXPOSE 8080

CMD ["/opt/startup.sh"]

HEALTHCHECK \
  --timeout=10s \
  --start-period=40s \
  CMD wget -q -O /dev/null http://localhost:8080/health
