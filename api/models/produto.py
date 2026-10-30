from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, CheckConstraint
from api.database import Base

# Tabela produto
class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    quantidade = Column(Integer, default=0)
    quantidade_minima = Column(Integer, default=0)
    unidade_medida = Column(String(50))

    __table_args__ = (
        UniqueConstraint("nome", name="uq_produtos_nome"),
        CheckConstraint("quantidade >= 0", name="check_produto_quantidade_nao_negativa"),
        CheckConstraint("quantidade_minima >= 0", name="check_produto_quantidade_minima_nao_negativa"),
    )
