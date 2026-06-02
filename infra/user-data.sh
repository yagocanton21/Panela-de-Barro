#!/bin/bash
# EC2 User Data — bootstrap automático da stack Panela de Barro
# Executa uma única vez na criação da instância (cloud-init)

set -e

# ---------- Dependências ----------
apt-get update -y
apt-get install -y ca-certificates curl gnupg git

# Docker (repositório oficial)
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker

# Permite ubuntu user rodar docker sem sudo
usermod -aG docker ubuntu

# ---------- Deploy da aplicação ----------
APP_DIR="/home/ubuntu/app"
REPO_URL="https://github.com/yagocanton21/Panela-de-Barro.git"

git clone "$REPO_URL" "$APP_DIR"
chown -R ubuntu:ubuntu "$APP_DIR"

# .env deve ser injetado via AWS Secrets Manager ou Parameter Store em produção real.
SECRET_KEY=$(openssl rand -hex 32)

cat > "$APP_DIR/.env" <<ENV
POSTGRES_USER=admin
POSTGRES_PASSWORD=TROQUE_ESTA_SENHA
POSTGRES_DB=estoque_db
SECRET_KEY=$SECRET_KEY
ADMIN_USERNAME=admin
ADMIN_PASSWORD=TROQUE_ESTA_SENHA
ADMIN_DISPLAY_NAME=Admin
LICENSE_KEY=INSIRA_A_LICENCA_AQUI
ENV

cd "$APP_DIR"
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Stack iniciada. Acesse http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
