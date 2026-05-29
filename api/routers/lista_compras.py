from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from api.database import get_connection
from api.auth import obter_usuario_atual
from api.models.lista_compras import ItemListaCompras
from api.models.produto import Produto
from api.models.movimentacao import Movimentacao
from api.schemas.lista_compras import CriarItemLista, ItemListaResponse
from api.schemas.produto import MessageResponse

router = APIRouter(
    prefix="/lista-compras",
    tags=["Lista de Compras"],
    dependencies=[Depends(obter_usuario_atual)]
)

# Rotas de lista de compras
@router.get("/", response_model=list[ItemListaResponse], summary="Listar itens da lista de compras")
async def listar_itens(db: AsyncSession = Depends(get_connection)):
    """Retorna todos os itens da lista de compras, ordenados por status (pendentes primeiro)."""
    query = select(
        ItemListaCompras.id,
        ItemListaCompras.produto_id,
        ItemListaCompras.nome_avulso,
        ItemListaCompras.quantidade,
        ItemListaCompras.comprado,
        ItemListaCompras.data_criacao,
        Produto.nome.label("nome_produto")
    ).outerjoin(Produto, ItemListaCompras.produto_id == Produto.id).order_by(ItemListaCompras.comprado.asc())

    resultado = await db.execute(query)
    return resultado.mappings().all()

# Rota para adicionar novo item à lista
@router.post("/", response_model=ItemListaResponse, summary="Adicionar item à lista")
async def adicionar_item(dados: CriarItemLista, db: AsyncSession = Depends(get_connection)):
    """Adiciona um novo item à lista de compras (manual ou vinculado a um produto)."""
    novo_item = ItemListaCompras(**dados.model_dump())
    db.add(novo_item)
    await db.commit()
    await db.refresh(novo_item)

    query = select(
        ItemListaCompras.id,
        ItemListaCompras.produto_id,
        ItemListaCompras.nome_avulso,
        ItemListaCompras.quantidade,
        ItemListaCompras.comprado,
        ItemListaCompras.data_criacao,
        Produto.nome.label("nome_produto")
    ).outerjoin(Produto, ItemListaCompras.produto_id == Produto.id).where(ItemListaCompras.id == novo_item.id)
    resultado = await db.execute(query)
    return resultado.mappings().first()

# Rota para sincronizar lista de compras com o estoque
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

    await db.commit()
    return {"message": f"Sincronização concluída. {len(produtos_faltando)} novos itens adicionados."}

# Rota para atualizar status do item (comprado ou não)
@router.patch("/{id}", response_model=MessageResponse, summary="Marcar item como comprado")
async def atualizar_status_item(
    id: int,
    comprado: bool = Body(..., embed=True),
    quantidade: int = Body(None, embed=True),
    db: AsyncSession = Depends(get_connection)
):
    """Atualiza o status de compra e/ou a quantidade do item na lista."""
    resultado = await db.execute(select(ItemListaCompras).where(ItemListaCompras.id == id))
    item = resultado.scalars().first()

    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado.")

    if quantidade is not None and quantidade > 0:
        item.quantidade = quantidade

    item.comprado = comprado
    await db.commit()

    return {"message": "Status atualizado."}

# Rota para dar entrada nos itens comprados e limpar a lista
@router.post("/finalizar", response_model=MessageResponse, summary="Finalizar compras")
async def finalizar_compras(db: AsyncSession = Depends(get_connection)):
    """Dá entrada no estoque de todos os itens marcados como comprados e os remove da lista.

    Usa SELECT ... FOR UPDATE em lote nos produtos afetados para serializar com outras
    movimentações concorrentes e evitar race condition no saldo do estoque.
    """
    try:
        resultado = await db.execute(select(ItemListaCompras).where(ItemListaCompras.comprado == True))
        itens_comprados = resultado.scalars().all()

        if not itens_comprados:
            raise HTTPException(status_code=400, detail="Nenhum item comprado para finalizar.")

        produto_ids = {item.produto_id for item in itens_comprados if item.produto_id}
        produtos_por_id: dict[int, Produto] = {}
        if produto_ids:
            res_prods = await db.execute(
                select(Produto).where(Produto.id.in_(produto_ids)).with_for_update()
            )
            produtos_por_id = {p.id: p for p in res_prods.scalars().all()}

        count_entrada = 0
        for item in itens_comprados:
            if item.produto_id:
                produto = produtos_por_id.get(item.produto_id)
                if produto:
                    produto.quantidade += item.quantidade
                    db.add(Movimentacao(
                        produto_id=produto.id,
                        tipo="entrada",
                        quantidade=item.quantidade,
                        motivo="Entrada via Finalização da Lista de Compras"
                    ))
                    count_entrada += 1

            await db.delete(item)

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
