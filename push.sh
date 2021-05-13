#!/usr/bin/env bash
source config.sh
echo $HASH
echo $TAG
echo $IMG
echo $LATEST
docker tag $IMG $LATEST
docker push $LATEST
