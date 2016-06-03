FROM node:6

WORKDIR /app
RUN npm install -g npm
EXPOSE 3000

ADD . /app
RUN npm install --production

CMD ["npm", "start"]
