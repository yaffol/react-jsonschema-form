#!/usr/bin/env bash
NAME="yaffol/deposit-ui-poc"
HASH=$(git log -1 --format=%H)
TAG=${HASH:-"MISSING"}
IMG="${NAME}:${TAG}"
LATEST="${NAME}:latest"
