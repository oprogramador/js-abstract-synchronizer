#!/bin/bash
set -e

dir_name=self_install_$RAND_$RAND_$RAND
mkdir $dir_name
cd $dir_name
echo '{}' > package.json
npm install --save js-abstract-synchronizer
cd ..
rm -rf $dir_name
