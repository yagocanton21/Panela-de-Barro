from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse
from app.database import get_connection 

router = APIRouter()

# Rota para listar todos os produtos
@router.get("/produtos")
def listar_produtos():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM produtos")
        produtos = cursor.fetchall()

        if not produtos:
            return JSONResponse(status_code=404, content={"message": "Nenhum produto encontrado."})
        return produtos
    finally:
        conn.close()

# Rota para buscar produto
@router.get("/produtos/{id}")
def buscar_produto(id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM produtos WHERE id = %s", (id,))
        produto = cursor.fetchone()

        if not produto:
            return JSONResponse(status_code=404, content={"message": "Produto nao encontrado."})
        return produto
    finally:
        conn.close()

# Rota para adicionar produto
@router.post("/produtos")
def adicionar_produto(
    nome: str = Body(...),
    categoria: str = Body(...),
    preco_custo: float = Body(...),
    quantidade: int = Body(default=0),
    unidade_medida: str = Body(...)
):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO produtos (nome, categoria, preco_custo, quantidade, unidade_medida) VALUES (%s, %s, %s, %s, %s)",
            (nome, categoria, preco_custo, quantidade, unidade_medida)
        )
        conn.commit()
        return JSONResponse(status_code=201, content={"message": "Produto adicionado com sucesso."})
    finally:
        conn.close()

# Rota para editar produto
@router.put("/produtos/{id}")
def editar_produto(
    id: int,
    nome: str = Body(...),
    categoria: str = Body(...),
    preco_custo: float = Body(...),
    quantidade: int = Body(default=0),
    unidade_medida: str = Body(...)
):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE produtos SET nome = %s, categoria = %s, preco_custo = %s, quantidade = %s, unidade_medida = %s WHERE id = %s",
            (nome, categoria, preco_custo, quantidade, unidade_medida, id)
        )
        conn.commit()
        return {"mensagem": "Produto atualizado com sucesso!"}
    finally:
        conn.close()

# Rota para deletar produto
@router.delete("/produtos/{id}")
def deletar_produto(id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM produtos WHERE id = %s", (id,))
        conn.commit()
        return {"mensagem": "Produto deletado com sucesso!"}
    finally:
        conn.close()