from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse
from app.database import get_connection

router = APIRouter()


# Rota para listar as categorias
@router.get("/categorias")
def listar_categorias():
    """Lista todas as categorias."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM categorias ORDER BY nome")
        categorias = cursor.fetchall()
        if not categorias:
            return JSONResponse(status_code=404, content={"message": "Nenhuma categoria encontrada."})
        return categorias
    finally:
        conn.close()


# Rota para buscar uma categoria pelo nome
@router.get("/categorias/{nome}")
def buscar_categoria_por_nome(nome: str):
    """Busca uma categoria pelo nome."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM categorias WHERE nome = %s", (nome,))
        categoria = cursor.fetchone()
        if not categoria:
            return JSONResponse(status_code=404, content={"message": "Categoria não encontrada."})
        return categoria
    finally:
        conn.close()


# Rota para criar uma categoria
@router.post("/categorias", status_code=201)
def criar_categoria(nome: str = Body(...)):
    """Cria uma nova categoria."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO categorias (nome) VALUES (%s)", (nome,))
        conn.commit()
        return {"mensagem": "Categoria criada com sucesso!"}
    finally:
        conn.close()


# Rota para editar uma categoria
@router.put("/categorias/{id}")
def editar_categoria(id: int, nome: str = Body(...)):
    """Editar uma categoria pelo ID."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE categorias SET nome = %s WHERE id = %s", (nome, id))
        conn.commit()
        return {"mensagem": "Categoria atualizada com sucesso!"}
    finally:
        conn.close()


# Rota para deletar uma categoria
@router.delete("/categorias/{id}")
def deletar_categoria(id: int):
    """Deleta uma categoria pelo ID."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM categorias WHERE id = %s", (id,))
        conn.commit()
        return {"mensagem": "Categoria deletada com sucesso!"}
    finally:
        conn.close()