#!/usr/bin/env bash
NAME="yaffol/deposit-ui-poc"
HASH=$(git log -1 --format=%H)
TAG=${HASH:-"MISSING"}
LATEST="${NAME}:latest"
#IMG="${NAME}:${TAG}"
IMG=$LATEST
#PULL=""
PULL="--pull always"
PORT=8081
echo "Looking for docker image: ${IMG}"
#docker image inspect $IMG  >/dev/null 2>&1 && echo 'Form runner image exists... Starting container...' || ./build.sh
if [ -z ${GOOGLE_APPLICATION_CREDENTIALS+x} ]
then
  echo "Google service account credentials not supplied."
  docker run $PULL --mount type=bind,src="$(pwd)/data",target=/app/packages/playground/src/data --mount type=bind,source="$(pwd)/build",target=/app/build -p 8080:8080 $IMG "$@"
else
    echo "Google service account credentials supplied."
    docker run $PULL --mount type=bind,src="$(pwd)/data",target=/app/packages/playground/src/data --mount type=bind,source="$(pwd)/build",target=/app/build  --mount type=bind,source="${GOOGLE_APPLICATION_CREDENTIALS}",target=/creds/gcsa.json -p 8080:8080 $IMG "$@"
fi

