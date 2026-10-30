from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from api.database import get_connection
from api.auth import obter_usuario_atual, verificar_admin
from api.models.produto import Produto
from api.models.categoria import Categoria
from api.models.movimentacao import Movimentacao
from api.schemas.produto import CriarProduto, AtualizarProduto, ProdutoResponse, MessageResponse, CriarProdutoResponse
from api.utils import get_or_404
from typing import List

router = APIRouter(
    tags=["Produtos"],
    dependencies=[Depends(obter_usuario_atual)]
)

# Query para listar produtos
def _produto_query():
    return select(
        Produto.id,
        Produto.nome,
        Categoria.nome.label("categoria"),
        Produto.categoria_id,
        Produto.quantidade,
        Produto.quantidade_minima,
        Produto.unidade_medida
    ).outerjoin(Categoria, Produto.categoria_id == Categoria.id)

# Rota para listar produtos
@router.get("/produtos", response_model=List[ProdutoResponse], summary="Listar todos os produtos")
async def listar_produtos(db: AsyncSession = Depends(get_connection)):
    """Retorna uma lista com todos os produtos cadastrados no estoque."""
    resultado = await db.execute(_produto_query())
    return [p._mapping for p in resultado.all()]

# Rota para listar produtos em falta
@router.get("/produtos/em-falta", response_model=List[ProdutoResponse], summary="Listar produtos em falta")
async def listar_produtos_em_falta(db: AsyncSession = Depends(get_connection)):
    """Retorna produtos com estoque baixo ou esgotado (quantidade <= quantidade mínima)."""
    query = _produto_query().where(Produto.quantidade <= Produto.quantidade_minima)
    resultado = await db.execute(query)
    return [p._mapping for p in resultado.all()]

# Rota para buscar produto por ID
@router.get("/produtos/{id}", response_model=ProdutoResponse, summary="Consultar produto por ID")
async def buscar_produto(id: int, db: AsyncSession = Depends(get_connection)):
    """Busca os detalhes de um produto específico através de seu ID."""
    resultado = await db.execute(_produto_query().where(Produto.id == id))
    produto = resultado.first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    return produto._mapping

# Rota para adicionar produto (Admin)
@router.post("/produtos", response_model=CriarProdutoResponse, status_code=status.HTTP_201_CREATED, summary="Adicionar novo produto", dependencies=[Depends(verificar_admin)])
async def adicionar_produto(dados: CriarProduto, db: AsyncSession = Depends(get_connection), admin: dict = Depends(verificar_admin)):
    """Adiciona um novo produto ao estoque (exclusivo para administradores)."""
    try:
        novo_produto = Produto(**dados.model_dump())
        db.add(novo_produto)
        await db.flush()

        if dados.quantidade > 0:
            db.add(Movimentacao(
                produto_id=novo_produto.id,
                usuario_id=admin.get("id"),
                tipo="entrada",
                quantidade=dados.quantidade,
                motivo="Cadastro inicial de produto"
            ))

        await db.commit()
        await db.refresh(novo_produto)
        return {"message": "Produto adicionado com sucesso.", "id": novo_produto.id}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Já existe um produto cadastrado com este nome.")

# Rota para atualizar produto (Admin)
@router.put("/produtos/{id}", response_model=MessageResponse, summary="Atualizar produto", dependencies=[Depends(verificar_admin)])
async def editar_produto(id: int, dados: AtualizarProduto, db: AsyncSession = Depends(get_connection), admin: dict = Depends(verificar_admin)):
    """Atualiza as informações de um produto existente e audita ajustes de estoque (exclusivo para administradores)."""
    produto = await get_or_404(db, Produto, id, "Produto não encontrado.")
    try:
        # Se a quantidade foi alterada, audita na tabela de movimentações
        if dados.quantidade is not None and dados.quantidade != produto.quantidade:
            diff = dados.quantidade - produto.quantidade
            tipo_mov = "entrada" if diff > 0 else "saida"
            db.add(Movimentacao(
                produto_id=produto.id,
                usuario_id=admin.get("id"),
                tipo=tipo_mov,
                quantidade=abs(diff),
                motivo="Ajuste manual de estoque via edição de produto"
            ))
            produto.quantidade = dados.quantidade

        produto.nome = dados.nome
        produto.categoria_id = dados.categoria_id
        produto.quantidade_minima = dados.quantidade_minima
        if dados.unidade_medida is not None:
            produto.unidade_medida = dados.unidade_medida

        await db.commit()
        return {"message": "Produto atualizado com sucesso!"}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Já existe um produto com este nome ou dados inválidos.")

# Rota para deletar produto (Admin)
@router.delete("/produtos/{id}", response_model=MessageResponse, summary="Deletar produto", dependencies=[Depends(verificar_admin)])
async def deletar_produto(id: int, db: AsyncSession = Depends(get_connection), admin: dict = Depends(verificar_admin)):
    """Deleta permanentemente um produto do registro de estoque (exclusivo para administradores)."""
    produto = await get_or_404(db, Produto, id, "Produto não encontrado.")
    await db.delete(produto)
    await db.commit()
    return {"message": "Produto deletado com sucesso!"}

