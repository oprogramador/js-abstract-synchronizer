FROM node:6.16.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY entrypoint.sh /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
