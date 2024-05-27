FROM node:lts-bullseye-slim

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

RUN npm run build

CMD ["node", "build"]