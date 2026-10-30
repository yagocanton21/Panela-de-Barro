from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from api.database import get_connection
from api.auth import obter_usuario_atual, verificar_admin
from api.models.categoria import Categoria
from api.schemas.categoria import CategoriaCreate, CategoriaResponse
from api.schemas.produto import MessageResponse
from api.utils import get_or_404
from typing import List

router = APIRouter(
    tags=["Categorias"],
    dependencies=[Depends(obter_usuario_atual)]
)

# Rota para listar categorias
@router.get("/categorias", response_model=List[CategoriaResponse], summary="Listar todas as categorias")
async def listar_categorias(db: AsyncSession = Depends(get_connection)):
    """Retorna uma lista com todas as categorias ordenadas por ID."""
    resultado = await db.execute(select(Categoria).order_by(Categoria.id))
    return resultado.scalars().all()

# Rota para buscar categoria pelo nome
@router.get("/categorias/{nome}", response_model=CategoriaResponse, summary="Buscar categoria pelo nome")
async def buscar_categoria_por_nome(nome: str, db: AsyncSession = Depends(get_connection)):
    """Busca os detalhes de uma categoria específica através de seu nome."""
    resultado = await db.execute(select(Categoria).where(Categoria.nome == nome))
    categoria = resultado.scalars().first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")
    return categoria


# Rota para criar categoria (Admin)
@router.post("/categorias", response_model=MessageResponse, status_code=status.HTTP_201_CREATED, summary="Criar nova categoria", dependencies=[Depends(verificar_admin)])
async def criar_categoria(dados: CategoriaCreate, db: AsyncSession = Depends(get_connection)):
    """Cria uma nova categoria para classificação de produtos (exclusivo para administradores)."""
    try:
        nova = Categoria(nome=dados.nome)
        db.add(nova)
        await db.commit()
        return {"message": "Categoria criada com sucesso!"}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Esta categoria já existe.")

# Rota para editar categoria (Admin)
@router.put("/categorias/{id}", response_model=MessageResponse, summary="Atualizar categoria", dependencies=[Depends(verificar_admin)])
async def editar_categoria(id: int, dados: CategoriaCreate, db: AsyncSession = Depends(get_connection)):
    """Atualiza o nome de uma categoria existente (exclusivo para administradores)."""
    categoria = await get_or_404(db, Categoria, id, "Categoria não encontrada.")
    try:
        categoria.nome = dados.nome
        await db.commit()
        return {"message": "Categoria atualizada com sucesso!"}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Já existe uma categoria com este nome.")

# Rota para deletar categoria (Admin)
@router.delete("/categorias/{id}", response_model=MessageResponse, summary="Deletar categoria", dependencies=[Depends(verificar_admin)])
async def deletar_categoria(id: int, db: AsyncSession = Depends(get_connection)):
    """Deleta permanentemente uma categoria se não houver produtos vinculados (exclusivo para administradores)."""
    categoria = await get_or_404(db, Categoria, id, "Categoria não encontrada.")
    try:
        await db.delete(categoria)
        await db.commit()
        return {"message": "Categoria deletada com sucesso!"}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Não é possível excluir uma categoria que possui produtos vinculados."
        )

