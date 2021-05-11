#!/bin/bash
umask 0000
/bin/bash

./update_manifest.sh
cd /app/packages/playground
if [ -z ${1+x} ]
then echo "arg1 is unset"
  npm run start
else
  echo "arg1 is set to '$1'"
  # SHOW_NETLIFY_BADGE causes the playground build process to use
  # an empty webpack publicPath
  export SHOW_NETLIFY_BADGE=1
  npm run build
  cp -av build "/app/build/$1"
fi
