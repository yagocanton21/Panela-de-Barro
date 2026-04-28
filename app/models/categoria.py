from sqlalchemy import Column, Integer, String
from app.database import Base

# Tabela categoria
class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), unique=True, nullable=False)
