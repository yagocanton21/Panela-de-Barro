from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index, text
from datetime import datetime
from api.database import Base

# Tabela que representa a lista de compras
class ItemListaCompras(Base):
    __tablename__ = "lista_compras"

    id = Column(Integer, primary_key=True)
    produto_id = Column(Integer, ForeignKey("produtos.id", ondelete="CASCADE"), nullable=True)
    nome_avulso = Column(String(255), nullable=True)
    quantidade = Column(Integer, default=1)
    comprado = Column(Boolean, default=False)
    data_criacao = Column(DateTime, default=datetime.now)

    __table_args__ = (
        Index(
            "uq_lista_compras_produto_pendente",
            "produto_id",
            unique=True,
            postgresql_where=text("comprado = false AND produto_id IS NOT NULL"),
            sqlite_where=text("comprado = 0 AND produto_id IS NOT NULL"),
        ),
    )
