#!/bin/bash
set -e

path=node_modules/js-abstract-synchronizer
rm $path
ln -s ../${APP_DIR:=build} $path
