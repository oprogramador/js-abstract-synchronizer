#!/bin/bash
set -e

cd `dirname $(which $0)`
cd ..

path=node_modules/js-abstract-synchronizer
rm -f $path
ln -s ../${APP_DIR:=build} $path
