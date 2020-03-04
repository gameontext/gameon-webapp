#!/bin/bash

WEBAPP_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd ${WEBAPP_DIR}

if [ $# -lt 1 ]
then
  ACTION=default
else
  ACTION=$1
  shift
fi

DOCKER_CMD="docker"

# Ensure volume exists for node modules (avoid putting in
# filesystem because of OS differences)
${DOCKER_CMD} volume inspect webapp-node-modules &> /dev/null
rc=$?
if [ $rc -ne 0 ]
then
  ${DOCKER_CMD} volume create --name webapp-node-modules
fi

# make sure node_modules directory exsts (mount point)
mkdir -p app/node_modules

# Modify this if your distribution gets UID/GID differently
userId=$(id -u)
groupId=$(id -g)

build_tools() {
  ${DOCKER_CMD} build \
    --build-arg userId=${userId}  \
    --build-arg groupId=${groupId} \
    -f Dockerfile-node \
    -t webapp-build .
}

PORT=

## Ensure the tools/build image exists.
tools_image=$(docker images -q webapp-build 2>/dev/null)
if [ "$tools_image" == "" ]
then
  build_tools
fi

case "$ACTION" in
  tools)
    # Force rebuild of tools/build image, clear node modules for future changes
    ${DOCKER_CMD} volume rm webapp-node-modules
    build_tools
    exit
  ;;
  debug)
    PORT="-p 9876:9876"
    WEBAPP_CMD=/bin/bash
  ;;
  shell)
    WEBAPP_CMD=/bin/bash
  ;;
  build)
    WEBAPP_CMD="/usr/local/bin/docker-build.sh build"
  ;;
  test)
    WEBAPP_CMD="/usr/local/bin/docker-build.sh test"
  ;;
  all)
    WEBAPP_CMD="/usr/local/bin/docker-build.sh all"
  ;;
  final)
    if [ ! -d ${WEBAPP_DIR}/app/dist ] || [ ! -f ${WEBAPP_DIR}/app/dist/index.html ]
    then
      echo "App hasn't been built, running '${BASH_SOURCE[0]} build' first"
      ${BASH_SOURCE[0]} build
    fi
    # Force rebuild of tools/build image
    ${DOCKER_CMD} build -t gameontext/gameon-webapp .
    echo
    echo "Docker images: "
    ${DOCKER_CMD} images | grep webapp
    exit 0
  ;;
  * )
    WEBAPP_CMD="/usr/local/bin/docker-build.sh default"
    ACTION=default
esac

if [ -n ${DOCKER_HOST} ]; then
  echo "DOCKER_HOST is set to ${DOCKER_HOST}. Bind-mounted volumes are unlikely to work. Trying native build for ${ACTION}"
  cd app
  npm install
  $(npm bin)/check-node-version --print --node 10
  rc=$?
  if [ $rc != 0 ]; then
    echo "Incorrect version of node installed. This project requires node 8."
    exit 1
  fi
  $(npm bin)/gulp ${ACTION}
else
  ${DOCKER_CMD} run --rm -it \
     --user="${userId}:${groupId}" \
     -v $PWD/app:/app \
     -v webapp-node-modules:/app/node_modules \
     ${PORT} \
     webapp-build \
     ${WEBAPP_CMD}
fi
