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
| Frontend   | React 18 + Vite                       |
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

## 💻 Desenvolvimento Local (Docker Compose)

Sobe a stack inteira (PostgreSQL + FastAPI + React + Nginx) na sua máquina, sem AWS. Ideal para desenvolver e testar antes do deploy.

**Pré-requisitos:** Docker + Docker Compose · `LICENSE_KEY` válida (o backend não inicia sem ela).

### Passo a passo

**1. Clonar o repositório**

```bash
git clone https://github.com/yagocanton21/Panela-de-Barro.git
cd Panela-de-Barro
```

**2. Colocar o `.env` na raiz do projeto**

Coloque na raiz o arquivo `.env` enviado pelo time (contém `ADMIN_PASSWORD` e `LICENSE_KEY` — não vai no repositório). Ajuste os valores conforme necessário; o modelo das variáveis está em `.env.example`.

> `POSTGRES_*` já vêm com valores padrão que funcionam local — não precisa mexer.

**3. Subir a stack**

```bash
docker compose up --build      # adicione -d para rodar em segundo plano
```

Faz build das imagens, sobe os 4 containers e aplica as migrations Alembic no boot.

**4. Acessar a aplicação**

Aguarde os containers ficarem `healthy` (~1 min no primeiro boot), depois acesse:

| Serviço | URL |
| ------- | --- |
| App (frontend via Nginx) | http://localhost |
| API — Swagger | http://localhost/api/docs |

> O `db` local é um container PostgreSQL 15 (volume `postgres_data`), **não** o RDS. As variáveis `POSTGRES_HOST`/`DATABASE_URL` são injetadas pelo Compose — não precisa configurar. O login inicial é `admin` com a senha definida em `ADMIN_PASSWORD`.

### Comandos úteis

```bash
docker compose ps                 # status dos containers (todos "healthy")
docker compose logs -f backend    # logs do backend
docker compose down               # para e remove os containers
docker compose down -v            # idem + apaga o volume do banco (reset total)
```

### Testes

A suíte roda em **SQLite em memória** — não precisa de banco nem dos containers no ar. Rode dentro do container do backend (já tem as dependências):

```bash
docker compose exec backend pytest
```

Ou local, em um virtualenv: `pip install -r requirements.txt && pytest`.

---

## ☁️ Deploy em Produção (VPC + EC2 + RDS + CloudFront)

Quick-start. Etapas detalhadas, verificação, limpeza, credenciais e licença no **[§2 Manual de Execução e Limpeza](#2-manual-de-execução-e-limpeza)**.

**Pré-requisitos:** AWS CLI configurado (`aws configure`) · Node.js ≥ 18 · `LICENSE_KEY` do time.

```bash
# 1. Provisiona VPC + subnets + RDS + EC2 (imprime o IP da EC2 ao final)
ADMIN_PASSWORD=<senha-do-admin> LICENSE_KEY=<chave-fornecida> bash infra/setup-rds.sh

# 2. Publica o frontend em S3 + CloudFront (HTTPS) — use o IP impresso no passo 1
EC2_PUBLIC_IP=<ip-da-ec2> bash infra/setup-s3-cloudfront.sh
```

Total ~25 min (RDS ~15 + CloudFront ~10). Ao terminar, limpe tudo: `bash infra/cleanup-aws.sh`.

**Opcional, antes do deploy:**

```bash
# Billing Alarm de governança (US$ 5, us-east-1)
ALERT_EMAIL=voce@exemplo.com bash infra/setup-billing-alarm.sh

# Golden Image — acelera próximos deploys
INSTANCE_ID=<i-xxxx> bash infra/create-ami.sh
```

---

## 📡 API — Endpoints Principais

> Documentação interativa (Swagger): **http://\<IP-EC2\>/api/docs**

### Autenticação

| Rota          | Método | Auth | Descrição                 |
| ------------- | ------ | ---- | ------------------------- |
| `/api/login`  | POST   | —    | Login OAuth2, retorna JWT |

### Produtos

| Rota                     | Método     | Auth | Descrição                          |
| ------------------------ | ---------- | ---- | ---------------------------------- |
| `/api/produtos`          | GET / POST | user | Listar / criar produtos            |
| `/api/produtos/em-falta` | GET        | user | Produtos abaixo do estoque mínimo  |

### Categorias

| Rota              | Método     | Auth | Descrição                 |
| ----------------- | ---------- | ---- | ------------------------- |
| `/api/categorias` | GET / POST | user | Listar / criar categorias |

### Movimentações

| Rota                 | Método     | Auth | Descrição         |
| -------------------- | ---------- | ---- | ----------------- |
| `/api/movimentacoes` | GET / POST | user | Entradas e saídas |

### Lista de Compras

| Rota                             | Método     | Auth | Descrição                          |
| -------------------------------- | ---------- | ---- | ---------------------------------- |
| `/api/lista-compras/`            | GET / POST | user | Itens da lista                     |
| `/api/lista-compras/sincronizar` | POST       | user | Sincroniza com produtos em falta   |
| `/api/lista-compras/finalizar`   | POST       | user | Finaliza e gera entrada no estoque |

### Usuários (Admin)

| Rota                 | Método       | Auth  | Descrição                         |
| -------------------- | ------------ | ----- | --------------------------------- |
| `/api/usuarios`      | GET / POST   | admin | Listar / criar usuários           |
| `/api/usuarios/{id}` | PUT / DELETE | admin | Editar (senha opcional) / deletar |

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
