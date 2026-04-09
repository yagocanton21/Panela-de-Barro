from fastapi import APIRouter, Body, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.auth import obter_usuario_atual
from app.models.categoria import (
    listar_categorias_db, 
    buscar_categoria_db, 
    buscar_categoria_por_nome_db,
    adicionar_categoria_db, 
    editar_categoria_db, 
    deletar_categoria_db
)
import psycopg2

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])

# Rota para listar as categorias
@router.get("/categorias", summary="Listar todas as categorias")
def listar_categorias():
    """Lista todas as categorias."""
    categorias = listar_categorias_db()
    if not categorias:
        return JSONResponse(status_code=404, content={"message": "Nenhuma categoria encontrada."})
    return categorias

# Rota para buscar uma categoria pelo nome
@router.get("/categorias/{nome}", summary="Buscar categoria pelo nome")
def buscar_categoria_por_nome(nome: str):
    """Busca uma categoria pelo nome."""
    categoria = buscar_categoria_por_nome_db(nome)
    if not categoria:
        return JSONResponse(status_code=404, content={"message": "Categoria não encontrada."})
    return categoria

# Rota para criar uma categoria
@router.post("/categorias", status_code=201, summary="Criar nova categoria")
def criar_categoria(nome: str = Body(...)):
    """Cria uma nova categoria."""
    try:
        adicionar_categoria_db(nome)
        return {"mensagem": "Categoria criada com sucesso!"}
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=400, detail="Esta categoria já existe.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar categoria: {str(e)}")

# Rota para editar uma categoria
@router.put("/categorias/{id}", summary="Atualizar categoria existente")
def editar_categoria(id: int, nome: str = Body(...)):
    """Editar uma categoria pelo ID."""
    try:
        editar_categoria_db(id, nome)
        return {"mensagem": "Categoria atualizada com sucesso!"}
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=400, detail="Já existe uma categoria com este nome.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar categoria: {str(e)}")

# Rota para deletar uma categoria
@router.delete("/categorias/{id}", summary="Deletar categoria")
def deletar_categoria(id: int):
    """Deleta uma categoria pelo ID."""
    try:
        deletar_categoria_db(id)
        return {"mensagem": "Categoria deletada com sucesso!"}
    except psycopg2.errors.ForeignKeyViolation:
        return JSONResponse(
            status_code=400, 
            content={"message": "Não é possível excluir uma categoria que possui produtos vinculados."}
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Erro interno: {str(e)}"})