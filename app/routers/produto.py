from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.responses import JSONResponse
from app.auth import obter_usuario_atual
from app.models.produto import (
    listar_produtos_db, 
    buscar_produto_db, 
    adicionar_produto_db, 
    editar_produto_db, 
    deletar_produto_db,
    listar_produtos_em_falta_db
)

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])

# Rota para listar todos os produtos
@router.get("/produtos", summary="Listar produtos")
def listar_produtos():
    """Retorna uma lista com todos os produtos cadastrados no estoque, contendo informações detalhadas e o nome da sua categoria."""
    try:
        produtos = listar_produtos_db()
        if not produtos:
            return JSONResponse(status_code=404, content={"message": "Nenhum produto encontrado."})
        return produtos
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno no servidor ao processar solicitação")

# Rota para listar produtos em falta
@router.get("/produtos/em-falta", summary="Listar produtos em falta")
def listar_produtos_em_falta():
    """Retorna uma lista com os produtos que estão com estoque baixo ou esgotado (quantidade <= quantidade mínima)."""
    try:
        produtos = listar_produtos_em_falta_db()
        if not produtos:
            return JSONResponse(status_code=404, content={"message": "Nenhum produto encontrado."})
        return produtos
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno no servidor ao processar solicitação")

# Rota para buscar produto
@router.get("/produtos/{id}", summary="Consultar produto por ID")
def buscar_produto(id: int):
    """Busca as informações e detalhes de um produto específico através de seu ID numérico."""
    try:
        produto = buscar_produto_db(id)
        if not produto:
            return JSONResponse(status_code=404, content={"message": "Produto nao encontrado."})
        return produto
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno no servidor ao processar solicitação")

# Rota para adicionar produto
@router.post("/produtos", status_code=201, summary="Adicionar novo produto")
def adicionar_produto(
    nome: str = Body(..., description="Nome do produto"),
    categoria: int = Body(..., description="ID numérico da categoria"),
    quantidade: int = Body(default=0, description="Quantidade inicial em estoque"),
    quantidade_minima: int = Body(default=0, description="Quantidade mínima em estoque"),
    unidade_medida: str = Body(..., description="kg, l, g, ml, un etc.")
):
    """Adiciona um novo produto ao estoque com a sua referida quantidade e unidade de medida."""
    if quantidade < 0:
        return JSONResponse(status_code=400, content={"message": "A quantidade inicial não pode ser negativa."})

    try:
        adicionar_produto_db(nome, categoria, quantidade, quantidade_minima, unidade_medida)
        return JSONResponse(status_code=201, content={"message": "Produto adicionado com sucesso."})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno no servidor ao processar solicitação")

# Rota para editar produto
@router.put("/produtos/{id}", summary="Atualizar dados de um produto")
def editar_produto(
    id: int,
    nome: str = Body(...),
    categoria: int = Body(...),
    quantidade: int = Body(default=0),
    quantidade_minima: int = Body(default=0),
    unidade_medida: str = Body(...)
):
    """Atualiza as informações (nome, categoria, quantidade, unidade) de um produto existente através do seu ID."""
    try:
        editar_produto_db(id, nome, categoria, quantidade, quantidade_minima, unidade_medida)
        return {"mensagem": "Produto atualizado com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno no servidor ao processar solicitação")

# Rota para deletar produto
@router.delete("/produtos/{id}", summary="Deletar produto")
def deletar_produto(id: int):
    """Deleta permanentemente um produto do registro de estoque pelo seu ID."""
    try:
        deletar_produto_db(id)
        return {"mensagem": "Produto deletado com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno no servidor ao processar solicitação")
