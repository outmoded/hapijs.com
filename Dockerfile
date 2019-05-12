FROM node:lts-alpine

WORKDIR /usr/server

RUN apk update && apk add bash