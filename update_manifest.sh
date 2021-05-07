#!/usr/bin/env bash

cd ./packages/playground/src
node translate.js
cd data
python3 generate-manifest.py
