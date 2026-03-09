from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.database import get_connection
import psycopg2
import psycopg2.extras

class CategoriaSchema(BaseModel):
    nome: str

router = APIRouter()


# Rota para listar as categorias
@router.get("/categorias", summary="Listar todas as categorias")
def listar_categorias():
    """Lista todas as categorias."""
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM categorias ORDER BY nome")
        categorias = cursor.fetchall()
        if not categorias:
            return JSONResponse(status_code=404, content={"message": "Nenhuma categoria encontrada."})
        return categorias
    finally:
        conn.close()


# Rota para buscar uma categoria pelo nome
@router.get("/categorias/{nome}", summary="Buscar categoria pelo nome")
def buscar_categoria_por_nome(nome: str):
    """Busca uma categoria pelo nome."""
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM categorias WHERE nome = %s", (nome,))
        categoria = cursor.fetchone()
        if not categoria:
            return JSONResponse(status_code=404, content={"message": "Categoria não encontrada."})
        return categoria
    finally:
        conn.close()


# Rota para criar uma categoria
@router.post("/categorias", status_code=201, summary="Criar nova categoria")
def criar_categoria(categoria: CategoriaSchema):
    """Cria uma nova categoria."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO categorias (nome) VALUES (%s)", (categoria.nome,))
        conn.commit()
        return {"mensagem": "Categoria criada com sucesso!"}
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Esta categoria já existe.")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar categoria: {str(e)}")
    finally:
        conn.close()


# Rota para editar uma categoria
@router.put("/categorias/{id}", summary="Atualizar categoria existente")
def editar_categoria(id: int, categoria: CategoriaSchema):
    """Editar uma categoria pelo ID."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE categorias SET nome = %s WHERE id = %s", (categoria.nome, id))
        conn.commit()
        return {"mensagem": "Categoria atualizada com sucesso!"}
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Já existe uma categoria com este nome.")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar categoria: {str(e)}")
    finally:
        conn.close()


# Rota para deletar uma categoria
@router.delete("/categorias/{id}", summary="Deletar categoria")
def deletar_categoria(id: int):
    """Deleta uma categoria pelo ID."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM categorias WHERE id = %s", (id,))
        conn.commit()
        return {"mensagem": "Categoria deletada com sucesso!"}
    except psycopg2.errors.ForeignKeyViolation:
        return JSONResponse(
            status_code=400, 
            content={"message": "Não é possível excluir uma categoria que possui produtos vinculados."}
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Erro interno: {str(e)}"})
    finally:
        conn.close()