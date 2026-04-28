from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

# Tabela produto
class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    quantidade = Column(Integer, default=0)
    quantidade_minima = Column(Integer, default=0)
    unidade_medida = Column(String(50))
