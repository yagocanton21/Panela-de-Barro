"""initial

Revision ID: 5c13edaf5207
Revises:
Create Date: 2026-05-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5c13edaf5207"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "usuarios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome_exibicao", sa.String(length=255), nullable=False),
        sa.Column("usuario", sa.String(length=50), nullable=False),
        sa.Column("senha_hash", sa.String(), nullable=False),
        sa.Column("is_admin", sa.Boolean(), nullable=True),
        sa.Column("data_criacao", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("usuario"),
    )
    op.create_table(
        "categorias",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nome"),
    )
    op.create_table(
        "produtos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(length=255), nullable=False),
        sa.Column("categoria_id", sa.Integer(), nullable=True),
        sa.Column("quantidade", sa.Integer(), nullable=True),
        sa.Column("quantidade_minima", sa.Integer(), nullable=True),
        sa.Column("unidade_medida", sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(["categoria_id"], ["categorias.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "movimentacoes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("produto_id", sa.Integer(), nullable=False),
        sa.Column("tipo", sa.String(length=10), nullable=False),
        sa.Column("quantidade", sa.Integer(), nullable=False),
        sa.Column("data_hora", sa.DateTime(), nullable=True),
        sa.Column("motivo", sa.String(), nullable=True),
        sa.CheckConstraint("tipo IN ('entrada', 'saida')", name="check_tipo_movimentacao"),
        sa.ForeignKeyConstraint(["produto_id"], ["produtos.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "lista_compras",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("produto_id", sa.Integer(), nullable=True),
        sa.Column("nome_avulso", sa.String(length=255), nullable=True),
        sa.Column("quantidade", sa.Integer(), nullable=True),
        sa.Column("comprado", sa.Boolean(), nullable=True),
        sa.Column("data_criacao", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["produto_id"], ["produtos.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("lista_compras")
    op.drop_table("movimentacoes")
    op.drop_table("produtos")
    op.drop_table("categorias")
    op.drop_table("usuarios")
