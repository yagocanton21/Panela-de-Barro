import asyncio
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.database import Base, get_connection
import app.database as db_module
import os

# Configuração do banco de dados de teste via variável de ambiente
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost:5432/test_db")

# Engine global de teste com NullPool para evitar conflitos de conexão no CI
engine_test = create_async_engine(
    DATABASE_URL, 
    poolclass=NullPool,
    echo=False
)

# Fábrica de sessões de teste
TestingSessionLocal = async_sessionmaker(
    bind=engine_test, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# IMPORTANTE: Sobrescrever ANTES de importar a app para que o lifespan pegue a engine correta
db_module.engine = engine_test
db_module.SessionLocal = TestingSessionLocal

from app.main import app



@pytest_asyncio.fixture(scope="session")
def event_loop():
    """Cria e gerencia o event loop para toda a sessão de testes."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    """Inicializa o esquema do banco de dados uma vez por sessão."""
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Limpeza final
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine_test.dispose()

@pytest_asyncio.fixture
async def db_session():
    """Provê uma sessão de banco de dados isolada para cada teste."""
    # Usamos uma conexão explícita para garantir controle total do loop
    async with engine_test.connect() as connection:
        async with TestingSessionLocal(bind=connection) as session:
            yield session
            # Forçamos rollback para garantir que um teste não suje o outro
            await session.rollback()

@pytest_asyncio.fixture(autouse=True)
async def override_dependencies(db_session):
    """Injeta a sessão de teste nas rotas do FastAPI."""
    async def _get_test_db():
        yield db_session
    
    app.dependency_overrides[get_connection] = _get_test_db
    yield
    app.dependency_overrides.clear()

