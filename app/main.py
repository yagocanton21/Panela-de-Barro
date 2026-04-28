from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.database import engine, Base
from app.routers import produto, categoria, movimentacao, usuario
import logging

# Configuração de Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cria as tabelas do banco de dados na inicialização
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Criar usuário administrador inicial se não houver nenhum
    from app.database import SessionLocal
    from app.models.usuario import Usuario, hash_password
    from sqlalchemy import select

    async with SessionLocal() as session:
        result = await session.execute(select(Usuario))
        if not result.scalars().first():
            logger.info("Criando usuário administrador inicial (Marcello)...")
            admin_inicial = Usuario(
                nome_exibicao="Marcello Admin",
                usuario="marcello",
                senha_hash=hash_password("123"), # Altere após o primeiro login
                is_admin=True
            )
            session.add(admin_inicial)
            await session.commit()
            logger.info("Usuário 'marcello' criado com sucesso! Senha padrão: admin123")

    yield
    # Fecha a engine ao desligar
    await engine.dispose()

tags_metadata = [
    {"name": "Produtos", "description": "Gestão de itens no estoque."},
    {"name": "Categorias", "description": "Classificação de produtos."},
    {"name": "Movimentações", "description": "Histórico de entradas e saídas."},
    {"name": "Usuários", "description": "Controle de acesso e autenticação."},
]

app = FastAPI(
    title="Panela de Barro - API Elite",
    description="""
    🚀 **Gestão de Estoque Profissional**
    
    Sistema de alta performance desenvolvido com FastAPI (Async) e Pydantic V2.
    
    **Recursos:**
    * 📦 Gestão completa de produtos
    * 🗂️ Organização por categorias
    * 🔄 Histórico de movimentações (Entradas/Saídas)
    * 🔐 Segurança via OAuth2 e JWT
    """,
    version="2.0.0",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middlewares de Segurança
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Na VPS, o Nginx deve restringir isso se necessário
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Liberando hosts para funcionamento na VPS (Oracle Cloud)
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["*"]
)

# Exception Handlers Globais
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro inesperado em {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Ocorreu um erro interno no servidor. Tente novamente mais tarde."}
    )

# Inclusão das Rotas
app.include_router(usuario.router)
app.include_router(produto.router)
app.include_router(categoria.router)
app.include_router(movimentacao.router)

@app.get("/", tags=["Início"])
def read_root():
    return {
        "status": "online",
        "message": "API Panela de Barro (Modo Elite) ativa.",
        "version": "2.0.0"
    }

