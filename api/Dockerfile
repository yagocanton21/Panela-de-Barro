FROM python:3.11-slim

WORKDIR /backend

# Base Debian (glibc): asyncpg e psycopg2-binary instalam como wheel pré-compilado,
# sem toolchain (gcc/musl-dev). Só curl para o healthcheck.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copia só o requirements primeiro para aproveitar cache de camadas
COPY api/requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# Copia a pasta api (código, alembic, entrypoint) — mesmo layout do repo,
# para o bind mount do compose dev (.:/backend) não divergir da imagem
COPY api/ api/
RUN chmod +x api/entrypoint.sh

# Cria usuário não-root e ajusta permissões
RUN useradd -m appuser && chown -R appuser:appuser /backend
USER appuser

# Expõe a porta do FastAPI
EXPOSE 8000

ENTRYPOINT ["./api/entrypoint.sh"]
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
