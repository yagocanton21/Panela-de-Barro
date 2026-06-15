# Testes

## Stack

- **pytest** com `pytest-asyncio` (modo `auto`)
- Banco: SQLite em memória por padrão (sem dependência externa)
- CI: PostgreSQL real no GitHub Actions (ver `.github/workflows/ci.yml`)

## Rodar localmente

```bash
# Na raiz do projeto, com venv ativo
pytest
```

Ou com mais detalhes:

```bash
pytest -v
```

### Dependências

```bash
pip install -r api/requirements.txt
```

Variável de ambiente mínima necessária (já configurada no `conftest.py` para testes):

```bash
# Não precisa setar manualmente — conftest.py define SECRET_KEY automaticamente
```

## Estrutura

```
tests/
├── conftest.py           # fixtures: engine SQLite, sessão, admin inicial, categorias seed
├── test_produtos.py      # CRUD de produtos
├── test_categorias.py    # CRUD de categorias
└── test_movimentacoes.py # entradas e saídas de estoque
```

## Configuração (pytest.ini)

```ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
```

## Banco de testes

Por padrão usa SQLite em memória — roda rápido, sem Docker.

Para rodar contra PostgreSQL real (como no CI):

```bash
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/test_db pytest
```

## CI (GitHub Actions)

O workflow `.github/workflows/ci.yml` roda em todo push/PR para `main` e `dev`:

1. Sobe PostgreSQL 15 como service
2. Instala dependências Python
3. Roda `pytest` com `DATABASE_URL` apontando para o PostgreSQL do CI
4. Faz `docker compose build` para validar o build das imagens

O build falha se qualquer teste falhar ou se o `docker compose build` retornar erro.
