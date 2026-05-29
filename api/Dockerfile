FROM python:3.11-alpine

WORKDIR /backend

# Adiciona dependências do sistema necessárias para o psycopg2
RUN apk update && apk add --no-cache \
    postgresql-dev \
    gcc \
    musl-dev \
    curl \
    && rm -rf /var/cache/apk/*

# Copia o requirements.txt da raiz (ajustado pelo contexto do Compose)
COPY requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# Copia a pasta api para dentro do container
COPY api/ api/
COPY alembic/ alembic/
COPY alembic.ini .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Cria usuário não-root e ajusta permissões
RUN adduser -D appuser && chown -R appuser:appuser /backend
USER appuser

# Expõe a porta do FastAPI
EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
