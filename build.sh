if [ $# -lt 1 ]
then
  ACTION=build
else
  ACTION=$1
  shift
fi

DOCKER_CMD="docker"
if [ "$(uname)" != "Darwin" ] && [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]
then
    DOCKER_CMD="sudo docker"
fi

## Ensure volume exists for node modules (avoid putting in
## filesystem because of OS differences)
${DOCKER_CMD} volume inspect webapp-node-modules &> /dev/null
rc=$?
if [ $rc -ne 0 ]
then
  ${DOCKER_CMD} volume create --name webapp-node-modules
fi

## Ensure the tools/build image exists.
tools_image=$(docker images -q webapp-build 2>/dev/null)
if [ "$tools_image" == "" ]
then
  ${DOCKER_CMD} build -f Dockerfile-node -t webapp-build .
fi

PORT=

case "$ACTION" in
  tools)
    # Force rebuild of tools/build image
    ${DOCKER_CMD} build -f Dockerfile-node -t webapp-build .
  ;;
  build)
    WEBAPP_CMD=/usr/local/bin/docker-build.sh
  ;;
  debug)
    PORT="-p 9876:9876"
    WEBAPP_CMD=/bin/bash
  ;;
  shell)
    WEBAPP_CMD=/bin/bash
  ;;
  test)
    WEBAPP_CMD="/usr/local/bin/docker-build.sh test"
  ;;
esac


${DOCKER_CMD} run --rm -it \
   -v $PWD/app:/app \
   -v webapp-node-modules:/app/node_modules \
   ${PORT} \
   webapp-build \
   ${WEBAPP_CMD}
