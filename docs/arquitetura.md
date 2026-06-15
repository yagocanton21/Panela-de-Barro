# Arquitetura

## Visão Geral

```
                        Internet
                           │
                        :80 (host)
                           │
                      ┌────▼─────┐
                      │  Nginx   │  proxy reverso
                      └────┬─────┘
               ┌───────────┴───────────┐
               │                       │
          /api/*                   /* (resto)
               │                       │
        ┌──────▼──────┐        ┌───────▼──────┐
        │   Backend   │        │   Frontend   │
        │  FastAPI    │        │  React+Vite  │
        │  :8000      │        │  :5173       │
        └──────┬──────┘        └──────────────┘
               │
        ┌──────▼──────┐
        │  PostgreSQL │
        │     :5432   │
        └─────────────┘
```

Todos os serviços rodam na rede interna `panela_net` (bridge Docker). Apenas o Nginx expõe porta ao host.

## Serviços

| Serviço    | Imagem / Build         | Porta interna | Exposta ao host |
|------------|------------------------|---------------|-----------------|
| `nginx`    | `./nginx`              | 8080          | **80**          |
| `backend`  | `./api/Dockerfile`     | 8000          | —               |
| `frontend` | `./web`                | 5173          | —               |
| `db`       | `postgres:15`          | 5432          | —               |

## Roteamento Nginx

| Path         | Destino                        |
|--------------|--------------------------------|
| `/api/*`     | `http://backend:8000`          |
| `/docs`      | `http://backend:8000/docs`     |
| `/redoc`     | `http://backend:8000/redoc`    |
| `/*`         | `http://frontend:5173`         |

## Backend (FastAPI)

- Framework: FastAPI async com SQLAlchemy 2.0 async
- Auth: OAuth2 + JWT (python-jose), senha com bcrypt
- Banco: PostgreSQL via asyncpg; migrações com Alembic
- Licença: validada no startup via `api/license.py` — sem `LICENSE_KEY` válida o processo não sobe

### Módulos principais

```
api/
├── main.py          # app FastAPI, lifespan, middlewares, rotas
├── auth.py          # OAuth2, geração e validação de JWT
├── database.py      # engine async, SessionLocal, Base
├── license.py       # validação de licença
├── models/          # SQLAlchemy ORM
│   ├── produto.py
│   ├── categoria.py
│   ├── movimentacao.py
│   ├── lista_compras.py
│   └── usuario.py
├── routers/         # endpoints FastAPI
├── schemas/         # Pydantic V2
└── alembic/         # migrações
```

### Endpoints principais

| Grupo           | Prefixo             |
|-----------------|---------------------|
| Usuários / Auth | `/api/usuarios`     |
| Produtos        | `/api/produtos`     |
| Categorias      | `/api/categorias`   |
| Movimentações   | `/api/movimentacoes`|
| Lista de compras| `/api/lista-compras`|

Documentação interativa completa em `/docs` (Swagger) e `/redoc`.

## Frontend (React)

- React 19 + Vite + React Router 7
- Comunicação com API via `VITE_API_URL=/api` (relativo, passa pelo Nginx)
- Bibliotecas: Recharts (gráficos), Framer Motion (animações), Lucide (ícones)

## Banco de Dados

PostgreSQL 15. Schema gerenciado por Alembic.

Migrações aplicadas automaticamente pelo `entrypoint.sh` do backend antes do `uvicorn` iniciar.

### Modelos

- `usuarios` — login, senha_hash, is_admin
- `produtos` — nome, quantidade, unidade, preco, categoria_id
- `categorias` — nome
- `movimentacoes` — tipo (entrada/saída), quantidade, produto_id, usuario_id
- `lista_compras` — itens de compra sugeridos

## Fluxo de Autenticação

```
Cliente → POST /api/usuarios/login  →  JWT (Bearer token)
Cliente → qualquer rota protegida   →  Authorization: Bearer <token>
Backend → valida JWT → extrai usuario_id → segue request
```

## Deploy AWS (produção)

Ver [deploy-aws.md](deploy-aws.md).

Diferenças em produção:
- Frontend buildado e servido via S3 + CloudFront (não via container)
- Backend em EC2 com Docker Compose (nginx + backend + sem frontend local)
- Banco em RDS PostgreSQL (não container)
- Nginx usa `gateway.prod.conf` (sem proxy para frontend local)
