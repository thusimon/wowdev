FROM node:20-alpine3.19

WORKDIR /wowdev

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production

COPY client/build/ ./client/build/
COPY server/build/ ./server/build/

EXPOSE 3002
CMD [ "node", "server/build/index.js" ]
