FROM node:20-alpine

# Cria a pasta e ajusta o dono para o usuário node (já existente no node:alpine)
RUN mkdir -p /app && chown node:node /app

WORKDIR /app

# Muda para usuário não-root antes de instalar pacotes e copiar arquivos
USER node

# Adiciona curl para o healthcheck que vamos usar no docker-compose
USER root
RUN apk update && apk add --no-cache curl && rm -rf /var/cache/apk/*
USER node

COPY --chown=node:node package*.json .

RUN npm install

COPY --chown=node:node . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
