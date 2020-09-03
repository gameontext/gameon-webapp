#!/bin/sh

echo "using /tmp for config"
cp /etc/nginx/nginx.conf /tmp/nginx.conf

if [ "${GAMEON_MODE}" == "development" ]
then
  if ! grep -q -r angular /opt/www/public
  then
    echo "The application was not built before packaging."
    exit 1
  fi

  # turn off sendfile for local development
  sed -i -e "s/sendfile: .*$/sendfile: off/" /tmp/nginx.conf
else
  # turn on sendfile
  sed -i -e "s/sendfile: .*$/sendfile: on/" /tmp/nginx.conf
fi

if [ "${GAMEON_LOG_FORMAT}" == "json" ]
then
  sed -i -e "s/access\.log .*$/access.log json_combined;/" /tmp/nginx.conf
else
  sed -i -e "s/access\.log .*$/access.log combined;/" /tmp/nginx.conf
fi


nginx -c /tmp/nginx.conf
