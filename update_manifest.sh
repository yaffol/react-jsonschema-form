#!/usr/bin/env bash
### Update the Form Runner's manifest.json ###

pushd ./packages/playground/src > /dev/null
node translate.js
python3 generate-manifest.py
popd > /dev/null
