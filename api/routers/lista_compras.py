from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from sqlalchemy.exc import IntegrityError
from api.database import get_connection
from api.auth import obter_usuario_atual
from api.models.lista_compras import ItemListaCompras
from api.models.produto import Produto
from api.models.movimentacao import Movimentacao
from api.schemas.lista_compras import CriarItemLista, ItemListaResponse
from api.schemas.produto import MessageResponse
from api.utils import get_or_404

router = APIRouter(
    prefix="/lista-compras",
    tags=["Lista de Compras"],
    dependencies=[Depends(obter_usuario_atual)]
)

# Função para consultar itens da lista de compras
def _item_lista_query():
    return select(
        ItemListaCompras.id,
        ItemListaCompras.produto_id,
        ItemListaCompras.nome_avulso,
        ItemListaCompras.quantidade,
        ItemListaCompras.comprado,
        ItemListaCompras.data_criacao,
        Produto.nome.label("nome_produto")
    ).outerjoin(Produto, ItemListaCompras.produto_id == Produto.id)

# Rota para listar itens da lista de compras
@router.get("/", response_model=list[ItemListaResponse], summary="Listar itens da lista de compras")
async def listar_itens(db: AsyncSession = Depends(get_connection)):
    """Retorna todos os itens da lista de compras, ordenados por status (pendentes primeiro)."""
    resultado = await db.execute(
        _item_lista_query().order_by(ItemListaCompras.comprado.asc())
    )
    return resultado.mappings().all()

# Rota para adicionar item à lista
@router.post("/", response_model=ItemListaResponse, summary="Adicionar item à lista")
async def adicionar_item(dados: CriarItemLista, db: AsyncSession = Depends(get_connection)):
    """Adiciona um novo item à lista de compras (manual ou vinculado a um produto)."""
    try:
        novo_item = ItemListaCompras(**dados.model_dump())
        db.add(novo_item)
        await db.commit()
        await db.refresh(novo_item)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Este produto já está pendente na lista de compras.")

    resultado = await db.execute(
        _item_lista_query().where(ItemListaCompras.id == novo_item.id)
    )
    return resultado.mappings().first()

# Rota para sincronizar com estoque
@router.post("/sincronizar", response_model=MessageResponse, summary="Sincronizar com estoque")
async def sincronizar_com_estoque(db: AsyncSession = Depends(get_connection)):
    """Busca produtos com estoque baixo e adiciona automaticamente à lista de compras."""
    pendentes_subquery = select(ItemListaCompras.produto_id).where(
        ItemListaCompras.comprado == False,
        ItemListaCompras.produto_id.is_not(None)
    )

    query_faltando = select(Produto).where(
        Produto.quantidade <= Produto.quantidade_minima,
        Produto.id.not_in(pendentes_subquery)
    )
    resultado = await db.execute(query_faltando)
    produtos_faltando = resultado.scalars().all()

    for prod in produtos_faltando:
        db.add(ItemListaCompras(produto_id=prod.id, quantidade=max(1, prod.quantidade_minima - prod.quantidade)))

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        return {"message": "Sincronização já realizada por outra requisição simultânea."}

    return {"message": f"Sincronização concluída. {len(produtos_faltando)} novos itens adicionados."}

# Rota para marcar item como comprado
@router.patch("/{id}", response_model=MessageResponse, summary="Marcar item como comprado")
async def atualizar_status_item(
    id: int,
    comprado: bool = Body(..., embed=True),
    quantidade: int = Body(None, embed=True),
    db: AsyncSession = Depends(get_connection)
):
    """Atualiza o status de compra e/ou a quantidade do item na lista."""
    item = await get_or_404(db, ItemListaCompras, id, "Item não encontrado.")

    if quantidade is not None and quantidade > 0:
        item.quantidade = quantidade

    item.comprado = comprado
    await db.commit()
    return {"message": "Status atualizado."}

# Rota para finalizar compras
@router.post("/finalizar", response_model=MessageResponse, summary="Finalizar compras")
async def finalizar_compras(db: AsyncSession = Depends(get_connection)):
    """Dá entrada no estoque de todos os itens marcados como comprados e os remove da lista de forma atômica."""
    try:
        # Operação atômica no banco (Regra 3b):
        # Remove os itens comprados e retorna as linhas afetadas.
        # Qualquer execução concorrente encontrará 0 linhas e será barrada.
        stmt_delete = (
            delete(ItemListaCompras)
            .where(ItemListaCompras.comprado == True)
            .returning(ItemListaCompras.id, ItemListaCompras.produto_id, ItemListaCompras.quantidade)
        )
        resultado = await db.execute(stmt_delete)
        itens_comprados = resultado.all()

        if not itens_comprados:
            raise HTTPException(status_code=400, detail="Nenhum item comprado para finalizar.")

        count_entrada = 0
        for item in itens_comprados:
            if item.produto_id:
                # Atualização atômica do saldo do produto
                await db.execute(
                    update(Produto)
                    .where(Produto.id == item.produto_id)
                    .values(quantidade=Produto.quantidade + item.quantidade)
                )
                db.add(Movimentacao(
                    produto_id=item.produto_id,
                    tipo="entrada",
                    quantidade=item.quantidade,
                    motivo="Entrada via Finalização da Lista de Compras"
                ))
                count_entrada += 1

        await db.commit()
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        raise

    return {"message": f"Compras finalizadas! {len(itens_comprados)} item(ns) removido(s) da lista ({count_entrada} entraram no estoque)."}


# Rota para remover item da lista
@router.delete("/{id}", response_model=MessageResponse, summary="Remover item da lista")
async def remover_item(id: int, db: AsyncSession = Depends(get_connection)):
    """Remove permanentemente um item da lista de compras."""
    resultado = await db.execute(delete(ItemListaCompras).where(ItemListaCompras.id == id))
    if resultado.rowcount == 0:
        raise HTTPException(status_code=404, detail="Item não encontrado.")
    await db.commit()
    return {"message": "Item removido da lista."}
