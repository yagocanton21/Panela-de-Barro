from sqlalchemy import Column, Integer, String, Float

from app.database import Base

class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    categoria = Column(String, index=True)
    preco_custo = Column(Float)
    quantidade = Column(Integer, default=0)
    unidade_medida = Column(String)  # Ex: Kg, Litro, Unidade
