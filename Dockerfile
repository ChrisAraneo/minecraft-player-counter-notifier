FROM node:20-alpine3.19
ARG DISCORD_TOKEN
ENV token=$DISCORD_TOKEN
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
CMD npm run start DISCORD_TOKEN=${token}