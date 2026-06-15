FROM python:3.11-alpine

WORKDIR /backend

# Adiciona dependências do sistema necessárias para o psycopg2
RUN apk update && apk add --no-cache \
    postgresql-dev \
    gcc \
    musl-dev \
    curl \
    && rm -rf /var/cache/apk/*

# Copia só o requirements primeiro para aproveitar cache de camadas
COPY api/requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# Copia a pasta api (código, alembic, entrypoint) — mesmo layout do repo,
# para o bind mount do compose dev (.:/backend) não divergir da imagem
COPY api/ api/
RUN chmod +x api/entrypoint.sh

# Cria usuário não-root e ajusta permissões
RUN adduser -D appuser && chown -R appuser:appuser /backend
USER appuser

# Expõe a porta do FastAPI
EXPOSE 8000

ENTRYPOINT ["./api/entrypoint.sh"]
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
