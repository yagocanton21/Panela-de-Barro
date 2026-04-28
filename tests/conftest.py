import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.database import Base, get_connection
import app.database as db_module
import os

# URL do banco de dados de teste via variável de ambiente
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://user:password@localhost:5432/test_db"
)


@pytest_asyncio.fixture(scope="session")
async def _test_engine():
    """
    Cria a engine de teste DENTRO do event loop do pytest-asyncio.
    Isso garante que todas as conexões asyncpg fiquem vinculadas ao loop correto.
    """
    engine = create_async_engine(DATABASE_URL, poolclass=NullPool, echo=False)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="session")
async def _test_session_factory(_test_engine):
    """Fábrica de sessões vinculada à engine de teste."""
    factory = async_sessionmaker(
        bind=_test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    return factory


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database(_test_engine, _test_session_factory):
    """
    Inicializa o esquema e os dados de bootstrap uma vez por sessão.
    Sobrescreve as variáveis globais do módulo database ANTES de qualquer teste.
    """
    # 1. Sobrescrever engine e SessionLocal da aplicação
    db_module.engine = _test_engine
    db_module.SessionLocal = _test_session_factory

    # 2. Criar todas as tabelas
    async with _test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # 3. Bootstrap: criar admin e categorias iniciais (simula o lifespan)
    from app.models.usuario import Usuario, hash_password
    from app.models.categoria import Categoria
    from sqlalchemy import select

    async with _test_session_factory() as session:
        # Admin inicial
        result = await session.execute(select(Usuario))
        if not result.scalars().first():
            admin = Usuario(
                nome_exibicao="Marcello Admin",
                usuario="marcello",
                senha_hash=hash_password("123"),
                is_admin=True,
            )
            session.add(admin)

        # Categorias iniciais para os testes
        result = await session.execute(select(Categoria))
        if not result.scalars().first():
            for nome in ["Marmitas", "Carnes", "Bebidas", "Sobremesas"]:
                session.add(Categoria(nome=nome))

        await session.commit()

    yield

    # Limpeza final
    async with _test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(autouse=True)
async def override_dependencies(_test_session_factory):
    """
    Injeta uma sessão de teste fresca nas rotas do FastAPI para cada teste.
    Cada chamada de dependência recebe sua própria sessão limpa.
    """
    from app.main import app

    async def _get_test_db():
        async with _test_session_factory() as session:
            yield session

    app.dependency_overrides[get_connection] = _get_test_db
    yield
    app.dependency_overrides.clear()
