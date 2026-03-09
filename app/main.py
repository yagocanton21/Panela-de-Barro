from fastapi import FastAPI
from app.models.produto import criar_tabela_produtos
from app.models.categoria import criar_tabela_categorias
from app.models.movimentacao import criar_tabela_movimentacoes
from app.routers import produto, categoria, movimentacao
from fastapi.middleware.cors import CORSMiddleware

tags_metadata = [
    {
        "name": "Produtos",
        "description": "Operações com produtos. Onde é feito o registro, leitura, alteração e exclusão dos itens no estoque.",
    },
    {
        "name": "Categorias",
        "description": "Gerenciamento das categorias para classificar e organizar os produtos.",
    },
    {
        "name": "Movimentações",
        "description": "Registro do histórico de gestão de entradas e saídas do estoque do restaurante.",
    },
]

app = FastAPI(
    title="Panela de Barro - API de Estoque",
    description="Acompanhamento e gestão de estoque para o Restaurante Panela de Barro.",
    version="1.0.0",
    openapi_tags=tags_metadata,
    contact={
        "name": "Equipe de Desenvolvimento",
    }
)

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
criar_tabela_categorias()
criar_tabela_produtos()
criar_tabela_movimentacoes()

# Rotas
app.include_router(produto.router, tags=["Produtos"])
app.include_router(categoria.router, tags=["Categorias"])
app.include_router(movimentacao.router, tags=["Movimentações"])

@app.get("/", tags=["Início"])
def read_root():
    return {"message": "Bem-vindo à API de Estoque do Restaurante Panela de Barro!"}
