"""adicionar_constraints_concorrencia

Revision ID: c3d4e5f6a7b8
Revises: a1b2c3d4e5f6
Create Date: 2026-10-30 14:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Impede produtos duplicados com o mesmo nome
    op.create_unique_constraint("uq_produtos_nome", "produtos", ["nome"])

    # 2. Impede estoque e estoque mínimo negativos
    op.create_check_constraint("check_produto_quantidade_nao_negativa", "produtos", "quantidade >= 0")
    op.create_check_constraint("check_produto_quantidade_minima_nao_negativa", "produtos", "quantidade_minima >= 0")

    # 3. Impede itens duplicados pendentes para o mesmo produto na lista de compras
    op.create_index(
        "uq_lista_compras_produto_pendente",
        "lista_compras",
        ["produto_id"],
        unique=True,
        postgresql_where=sa.text("comprado = false AND produto_id IS NOT NULL")
    )


def downgrade() -> None:
    op.drop_index("uq_lista_compras_produto_pendente", table_name="lista_compras")
    op.drop_constraint("check_produto_quantidade_minima_nao_negativa", "produtos", type_="check")
    op.drop_constraint("check_produto_quantidade_nao_negativa", "produtos", type_="check")
    op.drop_constraint("uq_produtos_nome", "produtos", type_="unique")
