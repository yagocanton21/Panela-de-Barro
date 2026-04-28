from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.database import get_connection
from app.auth import obter_usuario_atual
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaResponse
from app.schemas.produto import MessageResponse
from typing import List

router = APIRouter(
    tags=["Categorias"],
    dependencies=[Depends(obter_usuario_atual)]
)

# Rota para listar todas as categorias
@router.get("/categorias", response_model=List[CategoriaResponse], summary="Listar todas as categorias")
async def listar_categorias(db: AsyncSession = Depends(get_connection)):
    """Retorna uma lista com todas as categorias ordenadas por ID."""
    resultado = await db.execute(select(Categoria).order_by(Categoria.id))
    categorias = resultado.scalars().all()
    
    if not categorias:
        raise HTTPException(status_code=404, detail="Nenhuma categoria encontrada.")
    
    return categorias

# Rota para buscar categoria por nome
@router.get("/categorias/{nome}", response_model=CategoriaResponse, summary="Buscar categoria pelo nome")
async def buscar_categoria_por_nome(nome: str, db: AsyncSession = Depends(get_connection)):
    """Busca os detalhes de uma categoria específica através de seu nome."""
    resultado = await db.execute(select(Categoria).where(Categoria.nome == nome))
    categoria = resultado.scalars().first()
    
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")
    
    return categoria

# Rota para criar categoria
@router.post("/categorias", response_model=MessageResponse, status_code=status.HTTP_201_CREATED, summary="Criar nova categoria")
async def criar_categoria(dados: CategoriaCreate, db: AsyncSession = Depends(get_connection)):
    """Cria uma nova categoria para classificação de produtos."""
    try:
        nova = Categoria(nome=dados.nome)
        db.add(nova)
        await db.commit()
        return {"message": "Categoria criada com sucesso!"}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Esta categoria já existe.")

# Rota para atualizar categoria
@router.put("/{id}", response_model=MessageResponse, summary="Atualizar categoria")
async def editar_categoria(id: int, dados: CategoriaCreate, db: AsyncSession = Depends(get_connection)):
    """Atualiza o nome de uma categoria existente."""
    resultado = await db.execute(select(Categoria).where(Categoria.id == id))
    categoria = resultado.scalars().first()
    
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")
    
    try:
        categoria.nome = dados.nome
        await db.commit()
        return {"message": "Categoria atualizada com sucesso!"}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Já existe uma categoria com este nome.")

# Rota para deletar categoria
@router.delete("/{id}", response_model=MessageResponse, summary="Deletar categoria")
async def deletar_categoria(id: int, db: AsyncSession = Depends(get_connection)):
    """Deleta permanentemente uma categoria se não houver produtos vinculados."""
    resultado = await db.execute(select(Categoria).where(Categoria.id == id))
    categoria = resultado.scalars().first()
    
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")
    
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