FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm @nestjs/cli
RUN pnpm install
COPY . .


