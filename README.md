<p align="center">
  <h1 align="center">🍲 Panela de Barro</h1>
  <p align="center">
    <strong>Sistema de Gestão de Estoque</strong><br/>
    Controle inteligente de produtos, movimentações e lista de compras.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS" />
</p>

---

## 📋 Sobre o Projeto

**Panela de Barro** é uma aplicação web fullstack para gestão de estoque, movimentações, lista de compras e controle de usuários. Projetada para ambientes de cozinha e restaurantes.

| Camada     | Tecnologia                            |
| ---------- | ------------------------------------- |
| Frontend   | React 19 + Vite                       |
| Backend    | FastAPI · Python 3.11 · async         |
| Banco      | PostgreSQL 15 (AWS RDS)               |
| ORM        | SQLAlchemy 2 (asyncpg) + Alembic      |
| Auth       | JWT + OAuth2 (bcrypt)                 |
| Proxy      | Nginx                                 |
| Container  | Docker + Docker Compose               |
| Rede       | VPC custom · subnets pública/privadas |
| CDN        | S3 + CloudFront (HTTPS)               |
| Infra      | EC2 + RDS + Secrets Manager (AWS)     |

---

## ✨ Funcionalidades

| Módulo              | Descrição                                                                        |
| ------------------- | -------------------------------------------------------------------------------- |
| 🔐 Autenticação     | Login JWT, hash bcrypt, rotas protegidas por role                                |
| 📦 Produtos         | CRUD completo, listagem de itens em falta (abaixo do mínimo)                     |
| 🏷️ Categorias       | CRUD com categorias pré-cadastradas                                              |
| 🔄 Movimentações    | Entradas e saídas com ajuste automático do estoque                               |
| 🛒 Lista de Compras | Sincroniza com produtos em falta, finalização gera entrada automática            |
| 👥 Usuários         | CRUD restrito a admins, edição com senha opcional, proteção contra auto-exclusão |
| 📊 Dashboard        | Visão geral do estoque com indicadores                                           |
| 📜 Histórico        | Registro de todas as movimentações realizadas                                    |

---

## 🚀 Rodando Localmente

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- Git

### 1. Clonar o repositório

```bash
git clone <URL-do-repositório>
cd Panela-de-Barro
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

Edite o `.env`:

| Variável            | Descrição                                          | Exemplo                  |
|---------------------|----------------------------------------------------|--------------------------|
| `POSTGRES_USER`     | Usuário do banco PostgreSQL                        | `admin`                  |
| `POSTGRES_PASSWORD` | Senha do banco (troque antes de subir)             | `senha-segura`           |
| `POSTGRES_DB`       | Nome do banco                                      | `estoque_db`             |
| `SECRET_KEY`        | Chave para assinar tokens JWT                      | string aleatória longa   |
| `ADMIN_USERNAME`    | Login do usuário administrador inicial             | `admin`                  |
| `ADMIN_PASSWORD`    | Senha do administrador inicial                     | `senha-admin`            |
| `ADMIN_DISPLAY_NAME`| Nome exibido do administrador                      | `Admin`                  |

> **`POSTGRES_HOST` / `POSTGRES_PORT`:** no Docker Compose são injetados automaticamente (`db` / `5432`) — não precisa no `.env`. Se rodar o backend **sem Docker** (uvicorn direto), defina `POSTGRES_HOST=localhost` e `POSTGRES_PORT=5432`, senão o backend falha com `Faltam configurações do banco de dados`.

### 3. Subir os serviços

```bash
docker compose up --build
```

Serviços iniciados:

| Serviço    | Descrição                        |
|------------|----------------------------------|
| `db`       | PostgreSQL 15                    |
| `backend`  | FastAPI (porta interna 8000)     |
| `frontend` | React + Vite (porta interna 5173)|
| `nginx`    | Proxy reverso — porta **80**     |

> As migrações do banco rodam automaticamente no start do backend.

### 4. Acessar

- **App:** http://localhost
- **Docs da API (Swagger):** http://localhost/docs

Login com as credenciais definidas em `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

### 5. Parar os serviços

```bash
docker compose down
```

Para apagar também os dados do banco (volume):

```bash
docker compose down -v
```

## ☁️ Deploy AWS

### Visão geral da infraestrutura

```
Internet
    │
    ├── CloudFront → S3 (frontend React buildado)
    │
    └── EC2 (público, porta 80)
            │  nginx + backend FastAPI
            │
        VPC privada
            │
           RDS PostgreSQL (subnet privada, sem acesso direto)
```

### Pré-requisitos

- **Windows/Linux: use WSL (Ubuntu)** — PowerShell puro não interpreta `.sh`, e Git Bash costuma dar `aws: command not found` por problema de PATH.
- AWS CLI configurado (`aws configure`) com permissões para EC2, RDS, S3, CloudFront, IAM, Secrets Manager
- Arquivo `.env` na raiz do projeto com `ADMIN_PASSWORD` e `LICENSE_KEY` preenchidos
- `openssl` disponível no shell
- Os scripts em `infra/` são `.sh` (bash)

### Criar uma access key

1. Acesse o **IAM** no console da AWS.
2. **Users** → selecione (ou crie) seu usuário → aba **Security credentials**.
3. Em **Access keys**, clique em **Create access key** → escolha **Command Line Interface (CLI)**.
4. Guarde o **Access key ID** e o **Secret access key** — o secret só aparece uma vez.

> O usuário precisa de permissões para EC2, RDS, S3, CloudFront, IAM e Secrets Manager.

### 🐧 Sessão WSL (Ubuntu)

> Instalar WSL primeiro (PowerShell como admin): `wsl --install`. Depois abra o Ubuntu.

**1. Instalar dependências**

```bash
sudo apt update
sudo apt install -y awscli jq
aws --version
```

**2. Autenticar**

```bash
aws configure
```

| Campo                  | Valor           |
|------------------------|------------------|
| AWS Access Key ID      | sua access key  |
| AWS Secret Access Key  | seu secret       |
| Default region name    | `us-east-1`      |
| Default output format  | `json`           |

Verificar:

```bash
aws sts get-caller-identity
```

**3. Rodar o deploy**

```bash
# 1. Infraestrutura (VPC + RDS + EC2) — ~8-10 min
bash infra/setup-rds.sh

# 2. Frontend (S3 + CloudFront) — use o IP exibido no passo 1
EC2_PUBLIC_IP=<seu-ip> bash infra/setup-s3-cloudfront.sh

# 3. Alarme de billing 
ALERT_EMAIL=seu@email.com bash infra/setup-billing-alarm.sh
```

> Override de região: `AWS_DEFAULT_REGION=... bash infra/setup-rds.sh`

**4. Acessar via SSH**

```bash
ssh -i ~/.ssh/panela-prod-key.pem ubuntu@<IP_DA_EC2>
```

> Repo clonado no Windows e aberto via WSL? Cuidado com `.env` salvo em CRLF (Notepad) — quebra o `source` do bash. Edite com VSCode ou rode `dos2unix .env` antes.

**5. Se seu IP mudar (perde SSH)**

```bash
bash infra/update-ssh-ip.sh
```

**6. Limpeza (destruir tudo, irreversível)**

```bash
bash infra/cleanup-aws.sh
```

### Variáveis opcionais do `setup-rds.sh`

| Variável        | Padrão               | Descrição                              |
|-----------------|----------------------|------------------------------------------|
| `DB_PASSWORD`   | gerada automaticamente | Senha do RDS                          |
| `EC2_TYPE`      | `t3.micro`           | Tipo da instância EC2                  |
| `ADMIN_IP`      | IP público detectado | IP liberado para SSH                   |
| `GOLDEN_AMI_ID` | Ubuntu 22.04 stock   | AMI pré-configurada (Golden Image)     |
| `REPO_URL`      | repo público         | URL do repositório clonado pela EC2    |

### Consultar o IP da EC2 novamente

```bash
aws ec2 describe-instances \
  --filters "Name=tag:App,Values=panela-de-barro" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text
```

### Checklist de deploy

- [ ] `.env` com `ADMIN_PASSWORD` e `LICENSE_KEY` válidos
- [ ] AWS CLI configurado e autenticado
- [ ] `bash infra/setup-rds.sh` — aguardar EC2 subir (~5 min)
- [ ] Testar `http://<IP_EC2>` no browser
- [ ] `bash infra/setup-s3-cloudfront.sh` — frontend no CDN
- [ ] `bash infra/setup-billing-alarm.sh` — alarme de custo
- [ ] Guardar o arquivo `~/.ssh/panela-prod-key.pem` em local seguro

---

## 📡 API

Documentação interativa (Swagger): **http://localhost/docs** (local) ou **http://\<IP-EC2\>/docs** (produção).

---

## 🔒 Segurança

- ✅ Senhas armazenadas com **hash bcrypt** (nunca em texto puro)
- ✅ Tokens **JWT assinados**, expiração de 24h
- ✅ Rotas administrativas protegidas — apenas admins
- ✅ **VPC custom** com subnets privadas isolando o RDS (sem rota para internet)
- ✅ RDS **sem acesso público** — porta 5432 liberada apenas para o SG da EC2
- ✅ **SSH restrito ao IP do administrador** (porta 22 nunca aberta a `0.0.0.0/0`)
- ✅ Frontend em **S3 privado** (OAC) servido só via CloudFront, **HTTPS obrigatório**
- ✅ Credenciais no **AWS Secrets Manager** — nunca em texto claro no disco
- ✅ IAM com **permissão mínima** — EC2 acessa apenas o secret específico do projeto
- ✅ `.env` no `.gitignore` — credenciais nunca versionadas
- ✅ Proteção contra **auto-exclusão** e exclusão do último admin

---

## 📄 Licença

Este projeto é de uso privado.

---

<p align="center">
  Feito com ☕ e 🍲 por<br/>
  <a href="https://github.com/yagocanton21">Yago Canton</a> · Marcello Esteves · Gustavo Fernandes
</p>
