"""add usuario_id to movimentacoes

Revision ID: a1b2c3d4e5f6
Revises: 5c13edaf5207
Create Date: 2026-05-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "5c13edaf5207"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "movimentacoes",
        sa.Column("usuario_id", sa.Integer(), sa.ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("movimentacoes", "usuario_id")
