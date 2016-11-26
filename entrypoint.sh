#!/bin/bash
set -e

npm install
APP_DIR=app npm run postinstall
npm start
