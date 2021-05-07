#!/usr/bin/env bash

cd /app/packages/playground/src
node translate.js
cd /app/packages/playground/src/data
python3 generate-manifest.py
cd /app/packages/playground
