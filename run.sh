#!/usr/bin/env bash
DOCKER_IMAGE=form-runner
DOCKER_IMAGE_TAG=latest

./check-env.sh
check_env_code=$?
echo "Return value from check-env.sh: ${check_env_code}"
if [ ! $check_env_code -eq 0 ]
then
  echo "Cancelled by user... Exiting."
  exit 1
fi
docker image inspect form-runner:latest >/dev/null 2>&1 && echo 'Form runner image exists... Starting container...' || ./build.sh
docker run -v "$(pwd)/data":/app/packages/playground/src/data --mount type=bind,source="${GOOGLE_APPLICATION_CREDENTIALS}",target=/creds/gcsa.json -p 8080:8080 form-runner:latest
