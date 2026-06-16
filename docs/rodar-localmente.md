# Rodando Localmente

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- Git

## 1. Clonar o repositório

```bash
git clone <URL-do-repositório>
cd Panela-de-Barro
```

## 2. Configurar variáveis de ambiente

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
| `LICENSE_KEY`       | Chave de licença (entregue pelo time)              | fornecida separadamente  |

> **`POSTGRES_HOST` / `POSTGRES_PORT`:** no Docker Compose são injetados automaticamente (`db` / `5432`) — não precisa no `.env`. Se rodar o backend **sem Docker** (uvicorn direto), defina `POSTGRES_HOST=localhost` e `POSTGRES_PORT=5432`, senão o backend falha com `Faltam configurações do banco de dados`.

## 3. Subir os serviços

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

## 4. Acessar

- **App:** http://localhost
- **Docs da API (Swagger):** http://localhost/docs

Login com as credenciais definidas em `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

## 5. Parar os serviços

```bash
docker compose down
```

Para apagar também os dados do banco (volume):

```bash
docker compose down -v
```

---

## Desenvolvimento sem Docker (opcional)

### Backend

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Suba só o banco via Docker
docker compose up db -d

# Aponte o backend para o banco local (fora do Docker, não há injeção do compose)
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432

# Rode as migrações
alembic -c api/alembic.ini upgrade head

# Inicie o servidor
uvicorn api.main:app --reload
```

Backend disponível em http://localhost:8000. Docs em http://localhost:8000/docs.

### Frontend

```bash
cd web
npm install
npm run dev
```

Frontend disponível em http://localhost:5173.

> Configure `VITE_API_URL=http://localhost:8000` no ambiente se rodar frontend sem nginx.

---

## Resolução de problemas

**Backend não inicia — erro de `LICENSE_KEY`**
Verifique se `LICENSE_KEY` está preenchida no `.env`. O backend rejeita start sem chave válida.

**Porta 80 ocupada**
Edite `docker-compose.yml`, linha `ports`, trocando `"80:8080"` pela porta desejada (ex: `"8080:8080"`).

**Banco não conecta**
O healthcheck do `db` precisa passar antes do backend subir. Aguarde alguns segundos após o `docker compose up` ou rode `docker compose ps` para verificar o status.
