FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm @nestjs/cli

RUN pnpm install

COPY . .