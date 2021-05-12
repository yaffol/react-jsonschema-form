#!/usr/bin/env bash
source config.sh
echo $HASH
echo $TAG
echo $IMG

docker build . -t $IMG
#docker tag $IMG $LATEST
