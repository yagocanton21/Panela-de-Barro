from fastapi import FastAPI
from app.models.produto import criar_tabela_produtos
from app.routers import produto

app = FastAPI(title="Panela de Barro - API de Estoque")

# Cria as tabelas no banco de dados ao iniciar a aplicação
criar_tabela_produtos()

# Rota de produtos
app.include_router(produto.router)


@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API de Estoque do Restaurante Panela de Barro!"}
