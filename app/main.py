from fastapi import FastAPI
from app.models.produto import criar_tabela_produtos
from app.models.categoria import criar_tabela_categorias
from app.routers import produto
from app.routers import categoria

app = FastAPI(title="Panela de Barro - API de Estoque")

# Cria as tabelas no banco de dados ao iniciar a aplicação
criar_tabela_produtos()
criar_tabela_categorias()

# Rota de produtos
app.include_router(produto.router)

# Rota de categorias
app.include_router(categoria.router)


@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API de Estoque do Restaurante Panela de Barro!"}
