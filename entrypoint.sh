#!/bin/bash

# Host dosyası kontrolü ve güncellemesi için fonksiyon
update_hosts() {
  echo "Checking and updating /etc/hosts..."
  if ! grep -q "local.qq.api.com" /etc/hosts; then
    echo "Adding local.qq.api.com to /etc/hosts..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS için
      echo "127.0.0.1 local.qq.api.com" | sudo tee -a /etc/hosts
    else
      # Linux için
      echo "127.0.0.1 local.qq.api.com" | sudo tee -a /etc/hosts
    fi
    echo "Host entry added successfully"
  else
    echo "local.qq.api.com already exists in /etc/hosts"
  fi

  # DNS önbelleğini temizle
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS için
    sudo dscacheutil -flushcache
    sudo killall -HUP mDNSResponder
  else
    # Linux için
    sudo systemctl restart systemd-resolved || true
  fi
}

if [ ! -f ".env.development" ]; then
  echo "No .env.development file found. Rejecting start"
  exit 1
fi

case "$1" in
  "dev")
    echo "Starting in development mode"
    update_hosts
    docker compose -f compose.dev.yml --env-file .env.development up
    ;;
    
  "dev:kill")
    echo "Stopping and removing containers"
    docker compose -f compose.dev.yml --env-file .env.development down -v --remove-orphans
    ;;

    "dev:reborn")
    echo "Stopping and removing containers"
    docker compose -f compose.dev.yml --env-file .env.development down -v --remove-orphans

    echo "Starting in development mode"
    update_hosts

    docker compose -f compose.dev.yml --env-file .env.development up --build
    ;;
    
    
  "dev:build")
    echo "Building containers"
    docker compose -f compose.dev.yml --env-file .env.development build
    ;;
    
  "dev:restart")
    echo "Restarting containers"
    update_hosts
    docker compose -f compose.dev.yml --env-file .env.development restart
    ;;
    
  "dev:logs")
    echo "Showing logs"
    docker compose -f compose.dev.yml --env-file .env.development logs -f
    ;;
    
  "dev:bash")
    echo "Opening bash in api container"
    docker compose -f compose.dev.yml --env-file .env.development exec api bash
    ;;
    
  *)
    echo "Invalid command. Available commands:"
    echo "  dev         - Start development environment"
    echo "  dev:kill    - Stop and remove all containers"
    echo "  dev:build   - Build containers"
    echo "  dev:restart - Restart containers"
    echo "  dev:logs    - Show container logs"
    echo "  dev:bash    - Open bash in api container"
    exit 1
    ;;
esac
