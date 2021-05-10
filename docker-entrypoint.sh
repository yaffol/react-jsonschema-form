#!/bin/bash
umask 0000
/bin/bash
CREDS_FILE=/creds/gcsa.json
if [ -f "$CREDS_FILE" ]; then
    echo "$CREDS_FILE exists."
else
    echo "$CREDS_FILE does not exist."
    echo "New translations will not be available. Continue (y/n)?"
    read -p "Continue (y/n)?" choice
    case "$choice" in
      y|Y ) echo "yes";;
      n|N ) [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1;; # handle exits from shell or function but don't exit interactive shell      * ) echo "invalid";;
      *) [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1;;
    esac
fi
./update_manifest.sh
cd /app/packages/playground
npm run start
