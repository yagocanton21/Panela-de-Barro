from fastapi import FastAPI
from app.models.produto import criar_tabela_produtos
from app.models.categoria import criar_tabela_categorias
from app.models.movimentacao import criar_tabela_movimentacoes
from app.routers import produto, categoria, movimentacao
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Panela de Barro - API de Estoque")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cria as tabelas no banco de dados ao iniciar a aplicação
criar_tabela_produtos()
criar_tabela_categorias()
criar_tabela_movimentacoes()

# Rota de produtos
app.include_router(produto.router)

# Rota de categorias
app.include_router(categoria.router)

# Rota de movimentações
app.include_router(movimentacao.router)


@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API de Estoque do Restaurante Panela de Barro!"}
