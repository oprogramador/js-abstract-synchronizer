#!/bin/bash

path=node_modules/js-abstract-synchronizer

if [ ! -L $path ]; then
  ln -s ../app $path
fi
