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
├── .env.example                # Template de variáveis de ambiente
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

# 3. Suba toda a stack
docker compose up -d --build

# 4. Acesse no navegador
# http://localhost
```

---

## ☁️ Deploy em Produção (VPS / EC2 Amazon)

### 1. Instalar Docker (Ubuntu/Debian)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Sair e entrar novamente na sessão SSH
```

### 2. Clonar e configurar

```bash
git clone https://github.com/yagocanton21/Panela-de-Barro.git
cd Panela-de-Barro
```

Copie o arquivo `.env` enviado diretamente para a raiz do projeto.

### 3. Subir a aplicação

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Acesse em `http://<IP-da-VPS>`.

### Atualizar para uma nova versão

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
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
