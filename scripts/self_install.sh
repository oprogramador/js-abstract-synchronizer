#!/bin/bash
set -e

dir_name=`uuidgen`
mkdir $dir_name
cd $dir_name
echo '{}' > package.json
npm install --save js-abstract-synchronizer
cd ..
rm -rf $dir_name
