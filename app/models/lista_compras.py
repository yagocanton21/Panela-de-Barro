from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

# Tabela que representa a lista de compras
class ItemListaCompras(Base):
    __tablename__ = "lista_compras"

    id = Column(Integer, primary_key=True)
    produto_id = Column(Integer, ForeignKey("produtos.id", ondelete="CASCADE"), nullable=True)
    nome_avulso = Column(String(255), nullable=True)
    quantidade = Column(Integer, default=1)
    comprado = Column(Boolean, default=False)
    data_criacao = Column(DateTime, default=datetime.now)
