FROM node:20-alpine
WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Global paketleri yükle
RUN npm install -g pnpm @nestjs/cli

# Bağımlılıkları yükle
RUN pnpm install

# Kaynak kodları kopyala
COPY . .