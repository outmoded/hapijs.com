FROM node:6

WORKDIR /app
EXPOSE 3000

ADD . /app
RUN npm install && npm test

CMD ["npm", "start"]
