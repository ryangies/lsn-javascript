#!/bin/bash

root="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
source "$LSN_COMMON/functions"
cd $root

git_repo="git://github.com/jquery/sizzle.git"
dir_proj="/home/ryan/Projects/sizzle"
dir_dest="$root/src/lib/ecma/dom"

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
# echo "Update: $dir_proj"
# git submodule update --init --recursive
  echo "Pull: $dir_proj"
  git pull
fi

#
# Copy to project space
#

cp -v dist/sizzle.js $dir_dest/_sizzle.js
