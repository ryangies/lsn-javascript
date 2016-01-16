#!/bin/bash

root="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
source "$LSN_COMMON/functions"
cd $root

git_repo="https://github.com/balupton/history.js.git"
dir_proj="/home/ryan/Projects/history.js"
dir_dest="$root/src/lib/ecma/platform"

#
# Update sources
#

if [ ! -d "$dir_proj" ]; then
  if ($(ask_yn "Create: $dir_proj")); then
    mkdir -p $dir_proj
    pdir=$(dir_absolute "$dir_proj/../")
    name=$(basename "$dir_proj")
    echo "Pdir $pdir"
    cd $pdir
    git clone "$git_repo" "$name"
    cd $dir_proj
  else
    exit 0
  fi
else
  cd $dir_proj
# git submodule update --init --recursive
  git pull
fi

#
# Copy to project space
#

mkdir -p $dir_dest
cp scripts/bundled/html4+html5/native.history.js $dir_dest/
