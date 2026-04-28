from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_connection
from app.auth import obter_usuario_atual
from app.models.produto import Produto
from app.models.categoria import Categoria
from app.schemas.produto import CriarProduto, ProdutoResponse, MessageResponse
from typing import List

router = APIRouter(
    tags=["Produtos"],
    dependencies=[Depends(obter_usuario_atual)]
)

# Rota para listar todos os produtos
@router.get("/produtos", response_model=List[ProdutoResponse], summary="Listar todos os produtos")
async def listar_produtos(db: AsyncSession = Depends(get_connection)):
    """Retorna uma lista com todos os produtos cadastrados no estoque."""
    query = select(
        Produto.id, 
        Produto.nome, 
        Categoria.nome.label("categoria"), 
        Produto.categoria_id, 
        Produto.quantidade, 
        Produto.quantidade_minima, 
        Produto.unidade_medida
    ).outerjoin(Categoria, Produto.categoria_id == Categoria.id)
    
    resultado = await db.execute(query)
    produtos = resultado.all()
    
    if not produtos:
        raise HTTPException(status_code=404, detail="Nenhum produto encontrado.")
    
    return [p._mapping for p in produtos]

# Rota para listar produtos em falta
@router.get("/produtos/em-falta", response_model=List[ProdutoResponse], summary="Listar produtos em falta")
async def listar_produtos_em_falta(db: AsyncSession = Depends(get_connection)):
    """Retorna produtos com estoque baixo ou esgotado (quantidade <= quantidade mínima)."""
    query = select(
        Produto.id, 
        Produto.nome, 
        Categoria.nome.label("categoria"), 
        Produto.categoria_id, 
        Produto.quantidade, 
        Produto.quantidade_minima, 
        Produto.unidade_medida
    ).outerjoin(Categoria, Produto.categoria_id == Categoria.id).where(Produto.quantidade <= Produto.quantidade_minima)
    
    resultado = await db.execute(query)
    produtos = resultado.all()
    
    if not produtos:
        raise HTTPException(status_code=404, detail="Nenhum produto em falta encontrado.")
    
    return [p._mapping for p in produtos]

# Rota para buscar produto por ID
@router.get("/produtos/{id}", response_model=ProdutoResponse, summary="Consultar produto por ID")
async def buscar_produto(id: int, db: AsyncSession = Depends(get_connection)):
    """Busca os detalhes de um produto específico através de seu ID."""
    query = select(
        Produto.id, 
        Produto.nome, 
        Categoria.nome.label("categoria"), 
        Produto.categoria_id,
        Produto.quantidade, 
        Produto.quantidade_minima, 
        Produto.unidade_medida
    ).outerjoin(Categoria, Produto.categoria_id == Categoria.id).where(Produto.id == id)
    
    resultado = await db.execute(query)
    produto = resultado.first()
    
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    
    return produto._mapping

# Rota para criar produto
@router.post("/produtos", response_model=MessageResponse, status_code=status.HTTP_201_CREATED, summary="Adicionar novo produto")
async def adicionar_produto(dados: CriarProduto, db: AsyncSession = Depends(get_connection)):
    """Adiciona um novo produto ao estoque."""
    novo_produto = Produto(**dados.model_dump())
    db.add(novo_produto)
    await db.commit()
    return {"message": "Produto adicionado com sucesso."}

# Rota para atualizar produto
@router.put("/produtos/{id}", response_model=MessageResponse, summary="Atualizar produto")
async def editar_produto(id: int, dados: CriarProduto, db: AsyncSession = Depends(get_connection)):
    """Atualiza as informações de um produto existente."""
    resultado = await db.execute(select(Produto).where(Produto.id == id))
    produto = resultado.scalars().first()
    
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    
    for campo, valor in dados.model_dump().items():
        setattr(produto, campo, valor)
        
    await db.commit()
    return {"message": "Produto atualizado com sucesso!"}

# Rota para deletar produto
@router.delete("/produtos/{id}", response_model=MessageResponse, summary="Deletar produto")
async def deletar_produto(id: int, db: AsyncSession = Depends(get_connection)):
    """Deleta permanentemente um produto do registro de estoque."""
    resultado = await db.execute(select(Produto).where(Produto.id == id))
    produto = resultado.scalars().first()
    
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    
    await db.delete(produto)
    await db.commit()
    return {"message": "Produto deletado com sucesso!"}

