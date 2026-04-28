from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_connection
from app.auth import obter_usuario_atual
from app.models.movimentacao import Movimentacao
from app.models.produto import Produto
from app.schemas.movimentacao import CriarMovimentacao, MovimentacaoResponse
from app.schemas.produto import MessageResponse, MovimentacaoMessageResponse
from typing import List

router = APIRouter(
    tags=["Movimentações"],
    dependencies=[Depends(obter_usuario_atual)]
)

# Rota para listar movimentações
@router.get("/movimentacoes", response_model=List[MovimentacaoResponse], summary="Listar histórico")
async def listar_movimentacoes(db: AsyncSession = Depends(get_connection)):
    """Retorna todas as movimentações registradas."""
    query = select(
        Movimentacao.id, 
        Movimentacao.produto_id, 
        Movimentacao.tipo,
        Movimentacao.quantidade, 
        Movimentacao.data_hora, 
        Movimentacao.motivo,
        Produto.nome.label("produto_nome")
    ).outerjoin(Produto, Movimentacao.produto_id == Produto.id).order_by(Movimentacao.data_hora.desc())
    
    resultado = await db.execute(query)
    movimentacoes = resultado.all()
    
    if not movimentacoes:
        raise HTTPException(status_code=404, detail="Nenhuma movimentação encontrada.")
        
    return [m._mapping for m in movimentacoes]

# Rota para criar movimentação
@router.post("/movimentacoes", response_model=MovimentacaoMessageResponse, status_code=status.HTTP_201_CREATED, summary="Registrar movimentação")
async def criar_movimentacao(dados: CriarMovimentacao, db: AsyncSession = Depends(get_connection)):
    """Cria uma nova movimentação e atualiza o saldo do produto no estoque."""
    # Buscar o produto
    resultado = await db.execute(select(Produto).where(Produto.id == dados.produto_id))
    produto = resultado.scalars().first()
    
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    
    # Processar estoque
    if dados.tipo == "entrada":
        produto.quantidade += dados.quantidade
    else: # saida
        if produto.quantidade < dados.quantidade:
            raise HTTPException(status_code=400, detail="Estoque insuficiente para esta saída.")
        produto.quantidade -= dados.quantidade
    
    # Registrar movimentação
    nova = Movimentacao(**dados.model_dump())
    db.add(nova)
    await db.commit()
    
    return {"mensagem": f"Movimentação de {dados.tipo} realizada. Estoque atual: {produto.quantidade}"}

# Rota para buscar movimentação por ID
@router.get("/{id}", response_model=MovimentacaoResponse, summary="Consultar movimentação por ID")
async def buscar_movimentacao(id: int, db: AsyncSession = Depends(get_connection)):
    """Busca os detalhes de uma movimentação específica."""
    query = select(
        Movimentacao.id, 
        Movimentacao.produto_id, 
        Movimentacao.tipo,
        Movimentacao.quantidade, 
        Movimentacao.data_hora, 
        Movimentacao.motivo,
        Produto.nome.label("produto_nome")
    ).outerjoin(Produto, Movimentacao.produto_id == Produto.id).where(Movimentacao.id == id)
    
    resultado = await db.execute(query)
    movimentacao = resultado.first()
    
    if not movimentacao:
        raise HTTPException(status_code=404, detail="Movimentação não encontrada.")
        
    return movimentacao._mapping

# Rota para deletar movimentação
@router.delete("/{id}", response_model=MessageResponse, summary="Deletar movimentação")
async def deletar_movimentacao(id: int, db: AsyncSession = Depends(get_connection)):
    """Deleta permanentemente um registro de movimentação."""
    resultado = await db.execute(select(Movimentacao).where(Movimentacao.id == id))
    movimentacao = resultado.scalars().first()
    
    if not movimentacao:
        raise HTTPException(status_code=404, detail="Movimentação não encontrada.")
    
    await db.delete(movimentacao)
    await db.commit()
    return {"message": "Registro de movimentação deletado com sucesso!"}

