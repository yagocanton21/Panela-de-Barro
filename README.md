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
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
</p>

---

## 📋 Sobre o Projeto

**Panela de Barro** é uma aplicação web fullstack para gestão de estoque, movimentações, lista de compras e controle de usuários. Projetada para ambientes de cozinha e restaurantes, a aplicação roda inteiramente em containers Docker com um único comando.

---

## ⚡ Stack Tecnológica

```
┌─────────────────────────────────────────────────┐
│                    Nginx :80                     │
│               (Proxy Reverso)                    │
├────────────────────┬────────────────────────────┤
│   Frontend :5173   │      Backend :8000          │
│   React + Vite     │      FastAPI (async)        │
│                    │      SQLAlchemy 2            │
│                    │      JWT + OAuth2            │
├────────────────────┴────────────────────────────┤
│              PostgreSQL 15                       │
│           (rede interna Docker)                  │
└─────────────────────────────────────────────────┘
```

| Camada     | Tecnologia                            |
| ---------- | ------------------------------------- |
| Frontend   | React 18 + Vite                       |
| Backend    | FastAPI · Python 3.11 · async         |
| Banco      | PostgreSQL 15                         |
| ORM        | SQLAlchemy 2 (asyncpg) + Alembic      |
| Auth       | JWT + OAuth2 (bcrypt)                 |
| Proxy      | Nginx                                 |
| Container  | Docker + Docker Compose               |
| CI         | GitHub Actions (pytest + PostgreSQL)  |

---

## ✨ Funcionalidades

| Módulo            | Descrição                                                                  |
| ----------------- | -------------------------------------------------------------------------- |
| 🔐 Autenticação   | Login JWT, hash bcrypt, rotas protegidas por role                         |
| 📦 Produtos       | CRUD completo, listagem de itens em falta (abaixo do mínimo)              |
| 🏷️ Categorias     | CRUD com categorias pré-cadastradas                                       |
| 🔄 Movimentações  | Entradas e saídas com ajuste automático do estoque                        |
| 🛒 Lista de Compras | Sincroniza com produtos em falta, finalização gera entrada automática   |
| 👥 Usuários       | CRUD restrito a admins, edição com senha opcional, proteção contra auto-exclusão |
| 📊 Dashboard      | Visão geral do estoque com indicadores                                    |
| 📜 Histórico      | Registro de todas as movimentações realizadas                             |

---

## 📁 Estrutura do Projeto

```
Panela-Barro/
├── app/                        # Backend FastAPI
│   ├── routers/                # Rotas da API
│   │   ├── produto.py          #   CRUD de produtos
│   │   ├── categoria.py        #   CRUD de categorias
│   │   ├── movimentacao.py     #   Entradas/saídas de estoque
│   │   ├── lista_compras.py    #   Lista de compras
│   │   └── usuario.py          #   Gestão de usuários (admin)
│   ├── models/                 # Models SQLAlchemy
│   ├── schemas/                # Schemas Pydantic
│   ├── auth.py                 # JWT + dependências de auth
│   ├── database.py             # Engine e sessão async
│   ├── main.py                 # Entrypoint FastAPI
│   └── Dockerfile
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx       # Tela de login
│       │   ├── Dashboard.jsx   # Painel principal
│       │   ├── Estoque.jsx     # Gestão de produtos
│       │   ├── CadastroProduto.jsx
│       │   ├── EditarProduto.jsx
│       │   ├── Categorias.jsx  # Gestão de categorias
│       │   ├── Movimentacoes.jsx # Entradas/saídas
│       │   ├── ListaCompras.jsx  # Lista de compras
│       │   ├── Historico.jsx   # Histórico de movimentações
│       │   └── Ajustes.jsx     # Gestão de usuários
│       └── api.js              # Cliente HTTP centralizado
│
├── nginx/                      # Proxy reverso (porta 80)
├── tests/                      # Testes automatizados (pytest)
├── .github/workflows/          # CI — GitHub Actions
├── docker-compose.yml          # Orquestração dos containers
├── .env                        # Variáveis de ambiente (não versionado)
└── requirements.txt            # Dependências Python
```

---

## 🚀 Como Rodar

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) ou Docker Engine + Compose (Linux)

### Setup rápido (desenvolvimento local)

```bash
# 1. Clone o repositório
git clone https://github.com/yagocanton21/Panela-de-Barro.git
cd Panela-de-Barro

# 2. Adicione o arquivo .env enviado na raiz do projeto

# 3. Garanta que o script de inicialização tenha permissão de execução:
# No Linux/Mac ou Git Bash (Windows):
chmod +x entrypoint.sh
# No Windows (Prompt/PowerShell), o Git pode aplicar essa permissão:
git update-index --chmod=+x entrypoint.sh

# 4. Suba toda a stack
docker compose up -d --build

# 5. Acesse no navegador
# http://localhost
```

---

## ☁️ Deploy em Produção (EC2 Amazon)

O deploy é totalmente automatizado via `infra/user-data.sh`.

### 1. Configurar o script

Antes de usar, edite o bloco `.env` dentro do `user-data.sh` com as credenciais e a `LICENSE_KEY` fornecida.

### 2. Criar a instância EC2

Cole o conteúdo do `user-data.sh` no campo **User Data** ao criar a instância EC2 (Ubuntu 22.04, t3.small ou superior).

O script cuida automaticamente de:
- Instalar Docker
- Clonar o repositório
- Configurar o `.env`
- Subir toda a stack

Acesse em `http://<IP-da-instância>` após ~5 minutos.

### Atualizar para uma nova versão

Acesse a instância via SSH e execute:

```bash
cd ~/app && git pull && docker compose -f docker-compose.prod.yml up -d --build
```

### Credenciais iniciais

O usuário admin é criado automaticamente no primeiro start, com base no `.env`:

| Variável             | Descrição                   |
| -------------------- | --------------------------- |
| `ADMIN_USERNAME`     | Login do admin              |
| `ADMIN_PASSWORD`     | Senha do admin              |
| `ADMIN_DISPLAY_NAME` | Nome de exibição            |

> **Dica:** Após o primeiro login, gerencie os usuários pela tela **Ajustes**.

---

## ⚙️ Variáveis de Ambiente

As configurações sensíveis (como chaves de autenticação JWT e senhas do banco de dados) são gerenciadas através de um arquivo `.env` enviado diretamente de forma privada. Esse arquivo é omitido do Git para manter a segurança do projeto.

---

## 📡 API — Endpoints Principais

> Documentação interativa (Swagger): **http://localhost/api/docs**

### Autenticação

| Rota          | Método | Auth  | Descrição              |
| ------------- | ------ | ----- | ---------------------- |
| `/api/login`  | POST   | —     | Login OAuth2, retorna JWT |

### Produtos

| Rota                     | Método     | Auth | Descrição                       |
| ------------------------ | ---------- | ---- | ------------------------------- |
| `/api/produtos`          | GET / POST | user | Listar / criar produtos         |
| `/api/produtos/em-falta` | GET        | user | Produtos abaixo do estoque mínimo |

### Categorias

| Rota               | Método     | Auth | Descrição                  |
| ------------------ | ---------- | ---- | -------------------------- |
| `/api/categorias`  | GET / POST | user | Listar / criar categorias  |

### Movimentações

| Rota                 | Método     | Auth | Descrição             |
| -------------------- | ---------- | ---- | --------------------- |
| `/api/movimentacoes` | GET / POST | user | Entradas e saídas     |

### Lista de Compras

| Rota                              | Método | Auth | Descrição                          |
| --------------------------------- | ------ | ---- | ---------------------------------- |
| `/api/lista-compras/`             | GET / POST | user | Itens da lista                 |
| `/api/lista-compras/sincronizar`  | POST   | user | Sincroniza com produtos em falta   |
| `/api/lista-compras/finalizar`    | POST   | user | Finaliza e gera entrada no estoque |

### Usuários (Admin)

| Rota                  | Método        | Auth  | Descrição                              |
| --------------------- | ------------- | ----- | -------------------------------------- |
| `/api/usuarios`       | GET / POST    | admin | Listar / criar usuários                |
| `/api/usuarios/{id}`  | PUT / DELETE  | admin | Editar (senha opcional) / deletar      |

---

## 🧪 Testes

```bash
# Rodar testes dentro do container
docker compose exec \
  -e DATABASE_URL="postgresql+asyncpg://admin:admin@db:5432/estoque_db" \
  backend pytest

# CI: roda automaticamente em push via GitHub Actions com service PostgreSQL
```

---

## 🛠️ Desenvolvimento

| Recurso             | Descrição                                        |
| -------------------- | ------------------------------------------------ |
| **HMR Frontend**     | Vite recarrega ao salvar arquivos em `frontend/src/` |
| **Hot Reload Backend** | Uvicorn com `--reload` ao salvar em `app/`       |

```bash
# Acompanhar logs em tempo real
docker compose logs -f backend
docker compose logs -f frontend

# Reconstruir apenas o backend
docker compose up -d --build backend

# Reiniciar tudo do zero (⚠️ apaga dados)
docker compose down -v
docker compose up -d --build
```

### 🗄️ Migrações de Banco de Dados (Alembic)

As migrações são rodadas automaticamente ao iniciar o container do backend (via `entrypoint.sh`). Para desenvolvimento local:

```bash
# Gerar uma nova migração após alterar um Model
docker compose exec backend alembic revision --autogenerate -m "descricao_da_mudanca"

# Aplicar migrações manualmente (se necessário)
docker compose exec backend alembic upgrade head
```

---

## 🔒 Segurança

- ✅ Senhas armazenadas com **hash bcrypt** (nunca em texto puro)
- ✅ Tokens **JWT assinados**, expiração de 24h
- ✅ Rotas administrativas protegidas — apenas admins
- ✅ Banco de dados **não exposto externamente** — rede interna Docker
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
                                   │ HTTP :80
                        ┌──────────▼──────────┐
                        │   Nginx (Alpine)     │  Proxy reverso
                        │   Porta interna 8080 │  + serve estático (prod)
                        └──────┬──────────┬───┘
               /               │          │           /api/
        ┌──────▼──────┐        │   ┌──────▼──────────┐
        │  Frontend    │        │   │    Backend        │
        │ React + Vite │        │   │  FastAPI (async)  │
        │ Node Alpine  │        │   │  Python Alpine    │
        └─────────────┘        │   └────────┬──────────┘
                                │            │ SQL (asyncpg)
                        rede panela_net       │
                                │   ┌────────▼──────────┐
                                │   │  PostgreSQL 15     │
                                └───│  Volume nomeado    │
                                    └────────────────────┘
```

Todos os serviços compartilham a rede `panela_net` (driver `bridge`). O banco de dados **não expõe portas ao host** — acessível apenas pelos containers na mesma rede via DNS interno do Docker (`db:5432`).

### 1.3 Decisões Técnicas

| Decisão | Justificativa |
|---|---|
| Imagem base `*-alpine` | Minimiza superfície de ataque e tamanho da imagem (~5 MB base vs ~900 MB debian) |
| Usuário não-root em todos os containers | Princípio do menor privilégio; processo não pode escrever fora de `/backend` ou `/app` |
| `RUN apk add && rm -rf /var/cache/apk/*` em camada única | Evita que o cache de pacotes persista em camada intermediária, reduzindo o tamanho final |
| `restart: unless-stopped` | Recuperação automática sem intervenção manual; para apenas em shutdown explícito |
| `healthcheck` + `depends_on: condition: service_healthy` | Garante que serviços dependentes só iniciem após o serviço upstream estar funcional |
| `start_period` no healthcheck | Grace period para evitar falsos negativos durante o boot lento da aplicação |
| Volume nomeado `postgres_data` | Dados sobrevivem a `docker compose down` (mas não a `docker compose down -v`) |
| `--mount=type=cache` no `pip install` | BuildKit cache: reinstalações não baixam pacotes novamente — acelera builds iterativos |
| Multi-stage build (web prod) | Stage `build` (Node) descartado; imagem final contém apenas arquivos estáticos + nginx |
| Alembic migrations no `entrypoint.sh` | Migrations aplicadas automaticamente a cada deploy; idempotente com `upgrade head` |
| JWT + bcrypt | Autenticação stateless; senhas nunca armazenadas em texto puro |

### 1.4 Modelo de Segurança (Blast Radius)

- **Rede isolada**: `panela_net` (bridge) — containers não podem alcançar serviços externos não mapeados
- **Banco sem porta exposta**: `db` usa `expose` (somente interno), nunca `ports`
- **Sem credenciais no código**: todas as variáveis sensíveis via `.env` (excluído do Git via `.gitignore`)
- **Sem usuário root em runtime**: `appuser` (api), `node` (frontend), `nginx` (proxy)

---

## 2. Manual de Execução e Limpeza

### 2.1 Pré-requisitos

- Docker Engine ≥ 24 ou Docker Desktop (Mac/Windows)
- Docker Compose Plugin v2 (`docker compose` — não `docker-compose`)
- Git

### 2.2 Ambiente de Desenvolvimento (Local)

```bash
# 1. Clonar o repositório
git clone https://github.com/yagocanton21/Panela-de-Barro.git
cd Panela-de-Barro

# 2. Criar o arquivo de variáveis de ambiente
#    (solicitar o .env ao responsável pelo projeto)

# 3. Garantir permissão de execução no entrypoint (Linux/Mac)
chmod +x entrypoint.sh

# 4. Subir a stack completa (build + start)
docker compose up -d --build

# 5. Aguardar todos os serviços ficarem healthy (~60s)
docker compose ps

# 6. Acessar a aplicação
#    http://localhost
#    http://localhost/api/docs  (Swagger)
```

**Verificar status dos containers:**

```bash
docker compose ps
# Todos devem exibir "healthy" na coluna STATUS
```

**Acompanhar logs em tempo real:**

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

**Testar conectividade DNS interna entre containers:**

```bash
# Confirma que o backend resolve o hostname "db" via DNS interno Docker
docker compose exec backend ping -c 3 db

# Confirma que o nginx alcança o backend pelo nome do serviço
docker compose exec nginx curl -s http://backend:8000/docs | head -5

# Confirma que o banco rejeita conexão de fora da rede (sem porta exposta)
# O comando abaixo DEVE falhar — prova do isolamento de rede:
curl -v localhost:5432
# Esperado: "Connection refused" (porta não publicada no host)
```

### 2.3 Ambiente de Produção (EC2 / VPS)

```bash
# SSH na instância
ssh -i chave.pem ubuntu@<IP-EC2>

# Clonar e configurar
git clone https://github.com/yagocanton21/Panela-de-Barro.git
cd Panela-de-Barro

# Copiar .env com credenciais de produção
# (NUNCA use as credenciais de desenvolvimento em produção)
nano .env

# Subir stack de produção
docker compose -f docker-compose.prod.yml up -d --build

# Verificar saúde dos serviços
docker compose -f docker-compose.prod.yml ps
```

**Alternativa com User Data (bootstrap automático EC2):**

O arquivo `infra/user-data.sh` realiza todo o bootstrap automaticamente ao criar a instância. Cole o conteúdo do arquivo no campo **User data** ao lançar a EC2 no console AWS. A instância instalará Docker, clonará o repositório e subirá a stack sem intervenção manual.

### 2.4 Atualizar para Nova Versão

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
# Compose só rebuild serviços com imagem alterada
```

### 2.5 Procedimento de Limpeza (Cleanup)

**Parar e remover containers (preserva dados):**

```bash
docker compose down
# ou para produção:
docker compose -f docker-compose.prod.yml down
```

**Remoção completa (containers + volumes — APAGA TODOS OS DADOS):**

```bash
docker compose down -v
# Remove: containers, redes, volume postgres_data
```

**Limpeza total de imagens e cache de build:**

```bash
docker system prune -af --volumes
```

**Se usando AWS — evitar cobranças após avaliação:**

Deletar na ordem abaixo para evitar custos residuais:

1. NAT Gateways (cobrado por hora mesmo sem tráfego)
2. Elastic IPs não associados
3. Instâncias EC2 (terminate — não apenas stop)
4. AMIs (Actions → Deregister) + Snapshots associados
5. RDS instances (sem snapshot final se não necessário)
6. Load Balancers
7. S3 buckets (esvaziar antes de deletar)

> **Atenção:** NAT Gateways esquecidos são a principal causa de estouro do Free Tier. Verificar em VPC → NAT Gateways após a avaliação.

### 2.6 Credenciais Iniciais

O usuário admin é criado automaticamente no primeiro start pelo `entrypoint.sh`, baseado nas variáveis do `.env`:

| Variável | Descrição |
|---|---|
| `ADMIN_USERNAME` | Login do administrador |
| `ADMIN_PASSWORD` | Senha do administrador |
| `ADMIN_DISPLAY_NAME` | Nome exibido na interface |

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

### 3.2 Gerar uma licença

Execute na máquina do emissor (requer `infra/license_private.pem`):

```bash
python3 infra/generate-license.py --client "Nome do Cliente" --days 365
```

O script imprime a `LICENSE_KEY` a ser adicionada no `.env` do servidor.

### 3.3 Configurar no servidor

Antes de executar o `user-data.sh`, substitua o placeholder no bloco `.env` do script:

```env
LICENSE_KEY=<chave gerada pelo script>
```

O bootstrap cuida do restante automaticamente.

### 3.4 Comportamento sem licença

| Situação | Resultado |
|---|---|
| `LICENSE_KEY` ausente | `RuntimeError` no startup — container não sobe |
| Chave inválida / adulterada | `RuntimeError` no startup — container não sobe |
| Chave expirada | `RuntimeError` no startup — container não sobe |

### 3.5 Renovação

Gere uma nova chave com `--days` maior e atualize o `.env` do servidor.

---
