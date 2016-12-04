#!/bin/bash
set -e

dir_name=self_install_${RANDOM}_${RANDOM}_${RANDOM}
mkdir $dir_name
cd $dir_name
echo '{}' > package.json
npm install --save js-abstract-synchronizer
node -e 'require("js-abstract-synchronizer")'
cd ..
rm -rf $dir_name
