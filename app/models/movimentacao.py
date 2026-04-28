from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, CheckConstraint
from datetime import datetime
from app.database import Base

# Tabela movimentação
class Movimentacao(Base):
    __tablename__ = "movimentacoes"
    id = Column(Integer, primary_key=True)
    produto_id = Column(Integer, ForeignKey("produtos.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(String(10), nullable=False)
    quantidade = Column(Integer, nullable=False)
    data_hora = Column(DateTime, default=datetime.now)
    motivo = Column(String)

    __table_args__ = (
        CheckConstraint("tipo IN ('entrada', 'saida')", name="check_tipo_movimentacao"),
    )
