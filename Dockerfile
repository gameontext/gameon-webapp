FROM nginx:stable-alpine

LABEL maintainer="Erin Schnabel <schnabel@us.ibm.com> (@ebullientworks)"

# support running as arbitrary user which belogs to the root group
RUN touch /var/run/nginx.pid \
 && chown -R nginx:root /var/run/nginx.pid \
 && chown -R nginx:root /var/cache/nginx \
 && chmod g+rwx /var/cache/nginx /var/run/nginx.pid /var/log/nginx

COPY docker/nginx.conf        /etc/nginx/nginx.conf
COPY docker/startup.sh        /opt/startup.sh
COPY app/dist/                /opt/www/public

EXPOSE 8080

USER nginx
ENTRYPOINT ["/opt/startup.sh"]

HEALTHCHECK \
  --timeout=10s \
  --start-period=40s \
  CMD wget -q -O /dev/null http://localhost:8080/health
