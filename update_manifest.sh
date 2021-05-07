#!/usr/bin/env bash

pushd ./packages/playground/src
node translate.js
python3 generate-manifest.py
popd
