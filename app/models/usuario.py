from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from passlib.context import CryptContext
from app.database import Base

# Configuração do Passlib para hash de senha
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

# Funções para hash e verificação de senha
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Função para verificar senha
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Tabela usuário
class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True)
    nome_exibicao = Column(String(255), nullable=False)
    usuario = Column(String(50), unique=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    data_criacao = Column(DateTime, default=datetime.now)
