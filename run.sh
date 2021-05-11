#!/usr/bin/env bash
source config.sh

echo "Looking for docker image: ${IMG}"
docker image inspect $IMG  >/dev/null 2>&1 && echo 'Form runner image exists... Starting container...' || ./build.sh
docker run -v "$(pwd)/data":/app/packages/playground/src/data --mount type=bind,source="${GOOGLE_APPLICATION_CREDENTIALS}",target=/creds/gcsa.json -p 8080:8080 $IMG
