#!/usr/bin/env bash
NAME="crossref/deposit-poc"
HASH=$(git log -1 --format=%H)
TAG=${HASH:-"MISSING"}
IMG="${NAME}:${TAG}"
LATEST="${NAME}:latest"
