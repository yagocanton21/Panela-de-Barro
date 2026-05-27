from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.database import get_connection
from app.auth import obter_usuario_atual
from app.models.movimentacao import Movimentacao
from app.models.produto import Produto
from app.models.usuario import Usuario
from app.schemas.movimentacao import CriarMovimentacao, MovimentacaoResponse
from app.schemas.produto import MessageResponse, MovimentacaoMessageResponse
from typing import List, Literal, Optional

router = APIRouter(
    tags=["Movimentações"],
    dependencies=[Depends(obter_usuario_atual)]
)

# Rota para listar movimentações
@router.get("/movimentacoes", response_model=List[MovimentacaoResponse], summary="Listar histórico")
async def listar_movimentacoes(
    db: AsyncSession = Depends(get_connection),
    tipo: Optional[Literal["entrada", "saida"]] = Query(None, description="Filtrar por tipo"),
    produto_id: Optional[int] = Query(None, description="Filtrar por produto"),
    usuario_id: Optional[int] = Query(None, description="Filtrar por usuário"),
    data_inicio: Optional[datetime] = Query(None, description="Data/hora mínima"),
    data_fim: Optional[datetime] = Query(None, description="Data/hora máxima"),
    limit: int = Query(100, ge=1, le=500, description="Máximo de registros"),
    offset: int = Query(0, ge=0, description="Deslocamento para paginação"),
):
    """Retorna movimentações com filtros opcionais por tipo, produto e período."""
    query = select(
        Movimentacao.id,
        Movimentacao.produto_id,
        Movimentacao.usuario_id,
        Movimentacao.tipo,
        Movimentacao.quantidade,
        Movimentacao.data_hora,
        Movimentacao.motivo,
        Produto.nome.label("produto_nome"),
        Usuario.nome_exibicao.label("usuario_nome")
    ).outerjoin(Produto, Movimentacao.produto_id == Produto.id)\
     .outerjoin(Usuario, Movimentacao.usuario_id == Usuario.id)

    if tipo is not None:
        query = query.where(Movimentacao.tipo == tipo)
    if produto_id is not None:
        query = query.where(Movimentacao.produto_id == produto_id)
    if usuario_id is not None:
        query = query.where(Movimentacao.usuario_id == usuario_id)
    if data_inicio is not None:
        query = query.where(Movimentacao.data_hora >= data_inicio)
    if data_fim is not None:
        query = query.where(Movimentacao.data_hora <= data_fim)

    query = query.order_by(Movimentacao.data_hora.desc()).limit(limit).offset(offset)

    resultado = await db.execute(query)
    movimentacoes = resultado.all()

    return [m._mapping for m in movimentacoes]

# Rota para criar movimentação
@router.post("/movimentacoes", response_model=MovimentacaoMessageResponse, status_code=status.HTTP_201_CREATED, summary="Registrar movimentação")
async def criar_movimentacao(dados: CriarMovimentacao, db: AsyncSession = Depends(get_connection), usuario_atual: dict = Depends(obter_usuario_atual)):
    """Cria uma nova movimentação e atualiza o saldo do produto no estoque.

    Usa SELECT ... FOR UPDATE para serializar atualizações concorrentes do estoque
    e evitar race condition entre saídas simultâneas (over-depletion do saldo).
    """
    try:
        resultado = await db.execute(
            select(Produto).where(Produto.id == dados.produto_id).with_for_update()
        )
        produto = resultado.scalars().first()

        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado.")

        if dados.tipo == "entrada":
            produto.quantidade += dados.quantidade
        else:  # saida
            if produto.quantidade < dados.quantidade:
                raise HTTPException(status_code=400, detail="Estoque insuficiente para esta saída.")
            produto.quantidade -= dados.quantidade

        nova = Movimentacao(**dados.model_dump(), usuario_id=usuario_atual.get("id"))
        db.add(nova)
        await db.commit()
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        raise

    return {"mensagem": f"Movimentação de {dados.tipo} realizada. Estoque atual: {produto.quantidade}"}

# Rota para buscar movimentação por ID
@router.get("/movimentacoes/{id}", response_model=MovimentacaoResponse, summary="Consultar movimentação por ID")
async def buscar_movimentacao(id: int, db: AsyncSession = Depends(get_connection)):
    """Busca os detalhes de uma movimentação específica."""
    query = select(
        Movimentacao.id,
        Movimentacao.produto_id,
        Movimentacao.usuario_id,
        Movimentacao.tipo,
        Movimentacao.quantidade,
        Movimentacao.data_hora,
        Movimentacao.motivo,
        Produto.nome.label("produto_nome"),
        Usuario.nome_exibicao.label("usuario_nome")
    ).outerjoin(Produto, Movimentacao.produto_id == Produto.id)\
     .outerjoin(Usuario, Movimentacao.usuario_id == Usuario.id)\
     .where(Movimentacao.id == id)
    
    resultado = await db.execute(query)
    movimentacao = resultado.first()
    
    if not movimentacao:
        raise HTTPException(status_code=404, detail="Movimentação não encontrada.")
        
    return movimentacao._mapping

# Rota para deletar movimentação
@router.delete("/movimentacoes/{id}", response_model=MessageResponse, summary="Deletar movimentação")
async def deletar_movimentacao(id: int, db: AsyncSession = Depends(get_connection)):
    """Deleta permanentemente um registro de movimentação."""
    resultado = await db.execute(select(Movimentacao).where(Movimentacao.id == id))
    movimentacao = resultado.scalars().first()
    
    if not movimentacao:
        raise HTTPException(status_code=404, detail="Movimentação não encontrada.")
    
    await db.delete(movimentacao)
    await db.commit()
    return {"message": "Registro de movimentação deletado com sucesso!"}

