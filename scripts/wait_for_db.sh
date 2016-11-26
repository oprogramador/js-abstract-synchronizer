#!/bin/bash

apt-get update
apt-get -y install netcat

until nc -z $DB_HOST $DB_PORT
do
  echo waiting for database
  sleep 1
done

for i in `seq 30`
do
  echo waiting for database
  sleep 1
done
