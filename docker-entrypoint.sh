#!/bin/bash
umask 0000
/bin/bash

./update_manifest.sh
cd /app/packages/playground
npm run start
