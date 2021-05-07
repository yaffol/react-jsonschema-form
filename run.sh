#!/usr/bin/env bash
docker image inspect form-runner:latest >/dev/null 2>&1 && echo 'Form runner image exists locally' || ./build.sh
docker run -p 8080:8080 form-runner:latest
