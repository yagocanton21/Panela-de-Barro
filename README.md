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

## ☁️ Deploy em Produção (VPC + EC2 + RDS + CloudFront)

**Pré-requisitos:** AWS CLI configurado (`aws configure`) · Node.js ≥ 18 · `LICENSE_KEY` do time.

### Passo a passo (em ordem)

```bash
# 1. Provisiona VPC + subnets + RDS + EC2 (imprime o IP da EC2 ao final)
ADMIN_PASSWORD=<senha-do-admin> LICENSE_KEY=<chave-fornecida> bash infra/setup-rds.sh

# 2. Publica o frontend em S3 + CloudFront (HTTPS) — use o IP impresso no passo 1
EC2_PUBLIC_IP=<ip-da-ec2> bash infra/setup-s3-cloudfront.sh
```

Pronto. O passo 1 imprime `http://<IP>` (backend) e o passo 2 imprime `https://<dominio>.cloudfront.net` (app). Total ~25 min (RDS ~15 + CloudFront ~10).

### Comandos auxiliares

```bash
# Golden Image (opcional, acelera próximos deploys)
INSTANCE_ID=<i-xxxx> bash infra/create-ami.sh

# Atualizar para nova versão
ssh -i ~/.ssh/panela-prod-key.pem ubuntu@<IP-EC2>
cd ~/app && git pull && docker compose -f docker-compose.prod.yml up -d --build

# Limpar tudo (evitar cobrança)
bash infra/cleanup-aws.sh             # remove tudo
bash infra/cleanup-aws.sh --dry-run   # prévia
```

> **SSH** restrito ao seu IP público (auto-detect; force com `ADMIN_IP=1.2.3.4`). Sem **NAT Gateway**. Cleanup remove: CloudFront → S3 → EC2 → AMI/Snapshots → RDS → Subnet Group → SGs → VPC → Secrets → IAM → Key Pair.

---

## 🎓 Para o Avaliador

Duas formas de avaliar:

### Opção 1 — Avaliação por evidências (recomendado)
Sem precisar de conta AWS. Confira os artefatos da entrega:
- **Vídeo de demonstração**: deploy funcional + teste de conectividade entre serviços
- **Prints**: `docker compose ps` (status `healthy`), `aws sts get-caller-identity`, regras de entrada dos Security Groups
- **Este repositório**: scripts em [`infra/`](infra/), Dockerfiles e `docker-compose.prod.yml`

### Opção 2 — Reproduzir o deploy na sua conta AWS

**Pré-requisitos:** AWS CLI configurado (`aws configure`, Free Tier serve) · Node.js ≥ 18 · `git` · o arquivo **`.env`** entregue junto com o projeto.

```bash
# 1. Clonar o repositório
git clone https://github.com/yagocanton21/Panela-de-Barro.git
cd Panela-de-Barro

# 2. Colocar na raiz do projeto o arquivo .env enviado pelo aluno
#    (contém ADMIN_PASSWORD e LICENSE_KEY — não vai no repositório).
#    O modelo das variáveis está em .env.example
cp /caminho/do/.env .env

# 3. Rede + backend (VPC, RDS, EC2). Lê o .env automaticamente.
#    Imprime o IP da EC2 ao final (~15 min)
bash infra/setup-rds.sh

# 4. Frontend em S3 + CloudFront (HTTPS). Imprime a URL da CDN (~10 min)
EC2_PUBLIC_IP=<ip-impresso-no-passo-3> bash infra/setup-s3-cloudfront.sh

# 5. Ao terminar a avaliação — remove TUDO para não gerar custo
bash infra/cleanup-aws.sh
```

> ⚠️ **O `.env` é obrigatório.** O backend recusa iniciar sem uma `LICENSE_KEY` válida. A chave privada que assina licenças **não está no repositório** (por segurança) e o `.env` é gitignored — por isso o aluno o entrega separadamente (anexo/vídeo), nunca versionado. O `setup-rds.sh` lê o `.env` da raiz sozinho; basta colocá-lo lá.
>
> O `user-data` da EC2 clona automaticamente este repositório público, então o deploy funciona mesmo executando a partir de outra conta AWS.

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

---

---

# Documentação Acadêmica — TCC Implementação de Sistemas (UniFAAT)

## 1. Detalhes da Aplicação

### 1.1 Visão Geral

**Panela de Barro** é um sistema web fullstack de gestão de estoque para ambientes de cozinha e restaurantes. Permite cadastro de produtos e categorias, registro de movimentações (entradas e saídas), lista de compras integrada e controle de acesso por perfil de usuário (admin/operador).

### 1.2 Arquitetura de Serviços

```
                        ┌─────────────────────┐
                        │   Usuário (Browser)  │
                        └──────────┬──────────┘
                                   │ HTTPS
                        ┌──────────▼──────────────┐
                        │   CloudFront (CDN/HTTPS) │  redirect HTTP→HTTPS
                        └──────┬───────────────┬───┘
                    /          │               │  /api/*
            ┌───────▼────────┐ │      ┌────────▼─────────────────────────┐
            │  S3 (privado)   │ │      │  VPC 10.0.0.0/16                  │
            │  React estático │ │      │  ┌────────────────────────────┐  │
            │  via OAC        │ │      │  │ Subnet pública 10.0.1.0/24 │  │
            └────────────────┘ │      │  │  ┌──────────────────────┐  │  │
                                │      │  │  │ EC2 (gateway + API)  │  │  │
                                │      │  │  │ Docker Compose       │  │  │
                                │      │  │  └──────────┬───────────┘  │  │
                                │      │  └─────────────│──────────────┘  │
                                │      │   SG: 5432 só da EC2 │            │
                                │      │  ┌───────────────────▼─────────┐ │
                                │      │  │ Subnets privadas            │ │
                                │      │  │ 10.0.2.0/24 · 10.0.3.0/24   │ │
                                │      │  │  ┌────────────────────────┐ │ │
                                │      │  │  │ RDS PostgreSQL 15      │ │ │
                                │      │  │  │ sem acesso público     │ │ │
                                │      │  │  └────────────────────────┘ │ │
                                │      │  └─────────────────────────────┘ │
                                │      └──────────────────────────────────┘
```

A EC2 fica em subnet **pública** (acesso via Internet Gateway, sem NAT); o RDS fica em subnets **privadas** (sem rota para internet), acessível apenas pela EC2 via Security Group. O frontend é servido por **S3 + CloudFront** sobre HTTPS; o CloudFront roteia `/api/*` para a EC2 no mesmo domínio. Credenciais gerenciadas pelo AWS Secrets Manager — EC2 busca no boot via IAM Role com permissão mínima.

### 1.3 Decisões Técnicas

| Decisão | Justificativa |
|---|---|
| Imagem base `*-alpine` | Minimiza superfície de ataque e tamanho da imagem (~5 MB base vs ~900 MB debian) |
| Usuário não-root em todos os containers | Princípio do menor privilégio; processo não pode escrever fora de `/backend` ou `/app` |
| `restart: unless-stopped` | Recuperação automática sem intervenção manual; para apenas em shutdown explícito |
| `healthcheck` + `depends_on: condition: service_healthy` | Garante que serviços dependentes só iniciem após o serviço upstream estar funcional |
| `start_period` no healthcheck | Grace period para evitar falsos negativos durante o boot lento da aplicação |
| VPC custom (10.0.0.0/16) | Isolamento de rede; EC2 em subnet pública, RDS em subnets privadas sem rota para internet (reduz blast radius) |
| Sem NAT Gateway | RDS não inicia conexões de saída → NAT desnecessário; evita o principal custo do Free Tier |
| SSH só do IP do admin | Porta 22 restrita a `/32` do administrador; reduz superfície de ataque |
| S3 privado + CloudFront (OAC) | Estático fora da EC2, distribuído por CDN com HTTPS; bucket nunca exposto publicamente |
| CloudFront com 2 origens | `/` → S3, `/api/*` → EC2 no mesmo domínio HTTPS — elimina mixed content |
| Golden Image (AMI) | AMI pós-bootstrap acelera escalonamento horizontal (sem reexecutar user-data) |
| AWS RDS | Banco gerenciado: backups automáticos (1 dia no Free Tier; até 35 em conta paga), storage encrypted, sem container de DB pra manter |
| AWS Secrets Manager | Credenciais nunca em texto claro no disco; EC2 busca via IAM Role com permissão mínima |
| `--mount=type=cache` no `pip install` | BuildKit cache: reinstalações não baixam pacotes novamente — acelera builds iterativos |
| Multi-stage build (web prod) | Stage `build` (Node) descartado; imagem final contém apenas arquivos estáticos + nginx |
| Alembic migrations no `entrypoint.sh` | Migrations aplicadas automaticamente a cada deploy; idempotente com `upgrade head` |
| JWT + bcrypt | Autenticação stateless; senhas nunca armazenadas em texto puro |

### 1.4 Modelo de Segurança (Blast Radius)

- **RDS isolado**: sem acesso público — porta 5432 liberada apenas para o Security Group da EC2
- **Secrets Manager**: credenciais nunca em disco; IAM inline policy permite `GetSecretValue` apenas no ARN específico do projeto
- **Sem credenciais no código**: variáveis sensíveis via `.env` (excluído do Git) gerado no boot a partir do secret
- **Sem usuário root em runtime**: `appuser` (api), `nginx` (proxy)

---

## 2. Manual de Execução e Limpeza

### 2.1 Pré-requisitos

- AWS CLI ≥ 2 configurado (`aws configure`) com permissões: EC2, VPC, RDS, IAM, Secrets Manager, SSM, S3, CloudFront
- Node.js ≥ 18 + npm (para buildar o frontend do S3/CloudFront)
- Python 3 (para gerar licença)
- Git

### 2.2 Deploy Completo (AWS)

**Passo único — Executar o deploy:**

```bash
ADMIN_PASSWORD=<senha-do-admin> LICENSE_KEY=<chave-fornecida-pelo-time> bash infra/setup-rds.sh
```

O script executa em ordem:

| Etapa | O que faz |
|---|---|
| VPC | Cria VPC `10.0.0.0/16` com DNS habilitado |
| Subnets + IGW | Subnet pública `10.0.1.0/24` (EC2) + privadas `10.0.2.0/24` e `10.0.3.0/24` (RDS); Internet Gateway e route table pública. Sem NAT |
| Security Groups | SG EC2 (80/443 públicos, **22 só do IP do admin**) e SG RDS (5432 só da EC2) |
| DB Subnet Group | Agrupa as subnets privadas (2 AZs) para o RDS |
| RDS | PostgreSQL 15, db.t3.micro, 20GB, encrypted, **backups automáticos** 1 dia/Free Tier (janela 03:00-04:00 UTC; `BACKUP_RETENTION` ajusta) |
| Secrets Manager | Armazena host, usuário, senha e nome do banco em JSON |
| IAM | Role + instance profile com acesso mínimo ao secret |
| Key Pair | Gera chave SSH em `~/.ssh/panela-prod-key.pem` |
| AMI | Usa Ubuntu 22.04 stock, ou `GOLDEN_AMI_ID` se informada (boot acelerado) |
| EC2 | Lança na subnet pública, injeta user-data que instala Docker, clona o repo, busca o secret e sobe a stack |

Duração total: ~15 minutos. No final imprime o IP e a URL de acesso.

**Frontend (S3 + CloudFront):** rode `EC2_PUBLIC_IP=<ip> bash infra/setup-s3-cloudfront.sh` para publicar o React em S3 privado distribuído por CloudFront com HTTPS obrigatório.

**Verificar após o script concluir:**

```bash
ssh -i ~/.ssh/panela-prod-key.pem ubuntu@<IP-EC2>
docker compose -f ~/app/docker-compose.prod.yml ps
# Todos devem exibir "healthy"
```

### 2.3 Atualizar para Nova Versão

```bash
ssh -i ~/.ssh/panela-prod-key.pem ubuntu@<IP-EC2>
cd ~/app && git pull && docker compose -f docker-compose.prod.yml up -d --build
```

### 2.4 Procedimento de Limpeza (Cleanup)

```bash
bash infra/cleanup-aws.sh           # remove todos os recursos AWS
bash infra/cleanup-aws.sh --dry-run # prévia sem executar
```

Remove em ordem: CloudFront → S3 → EC2 → AMI/Snapshots → RDS → DB Subnet Group → Security Groups → VPC (subnets, IGW, route tables) → Secrets Manager → IAM Role/Profile → Key Pair.

> **Atenção:** a deleção do CloudFront leva ~10-15 min (desabilita → aguarda `Deployed` → deleta). Este projeto **não cria NAT Gateway**. Verifique no console se restaram Elastic IPs ou Snapshots EBS/RDS órfãos — geram cobrança mesmo sem uso.

### 2.5 Credenciais Iniciais

O usuário admin é criado automaticamente no primeiro start pelo `entrypoint.sh`, com base nas variáveis passadas ao `setup-rds.sh`:

| Variável | Valor |
|---|---|
| Login | `admin` |
| Senha | valor de `ADMIN_PASSWORD` passado ao script |

Após o primeiro login, gerencie usuários pela tela **Ajustes**.

---

## 3. Sistema de Licença

O backend valida uma chave de licença no startup. Sem `LICENSE_KEY` válida no `.env`, a aplicação recusa inicializar.

### 3.1 Como funciona

A licença é um JWT assinado com chave RSA-2048. A chave privada fica exclusivamente com o emissor — o código embute apenas a chave pública para verificação.

```
Emissor (chave privada)  →  gera LICENSE_KEY  →  entrega ao operador
Servidor (chave pública) →  valida LICENSE_KEY no startup
```

### 3.2 Obter uma licença

A `LICENSE_KEY` é gerada pelo time do projeto e entregue ao operador. Sem a chave privada RSA do emissor não é possível gerar uma chave válida.

### 3.3 Comportamento sem licença

| Situação | Resultado |
|---|---|
| `LICENSE_KEY` ausente | `RuntimeError` no startup — container não sobe |
| Chave inválida / adulterada | `RuntimeError` no startup — container não sobe |
| Chave expirada | `RuntimeError` no startup — container não sobe |

### 3.4 Renovação

Gere uma nova chave com `--days` maior. Conecte via SSH na EC2, atualize `LICENSE_KEY` no `~/app/.env` e reinicie o backend:

```bash
ssh -i ~/.ssh/panela-prod-key.pem ubuntu@<IP-EC2>
nano ~/app/.env  # atualiza LICENSE_KEY
docker compose -f ~/app/docker-compose.prod.yml restart backend
```

---
