import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

# Puxa as informações escondidas no arquivo .env
load_dotenv()

# Pega as credenciais (usuário, senha, etc.) do arquivo .env
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")

# Trava o sistema se tiver informação faltando
if not all([POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT]):
    raise ValueError("Faltam configurações do banco de dados no arquivo .env!")

# Endereço do banco de dados
DATABASE_URL = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# Comunicação com o banco de dados
engine = create_async_engine(DATABASE_URL, echo=False)

# Cria uma conexão para cada pessoa que acessar a API
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

# Transforma classes em tabelas no banco
Base = declarative_base()

async def get_connection() -> AsyncGenerator[AsyncSession, None]:
    """
    Empresta uma conexão de banco de dados para a API usar e, 
    assim que ela terminar o trabalho, recolhe e fecha a conexão.
    """
    session = SessionLocal()
    try:
        yield session # Libera a conexão para uso
    finally:
        await session.close() # Fecha a conexão