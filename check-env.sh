#!/bin/bash

if [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "GOOGLE_APPLICATION_CREDENTIALS exists."
else
    echo "GOOGLE_APPLICATION_CREDENTIALS environment variable is not set."
    echo "It will not be possible to lookup new translations."
    read -p "Continue (y/n)?" choice
    case "$choice" in
      y|Y ) echo "yes";;
      n|N ) exit 1;; # handle exits from shell or function but don't exit interactive shell      * ) echo "invalid";;
      *) exit 1;;
    esac
fi
