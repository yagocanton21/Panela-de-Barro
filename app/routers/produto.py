from fastapi import APIRouter, Body, Depends
from fastapi.responses import JSONResponse
from app.database import get_connection 
from app.auth import obter_usuario_atual
import psycopg2.extras

router = APIRouter(dependencies=[Depends(obter_usuario_atual)])

# Rota para listar todos os produtos
@router.get("/produtos", summary="Listar produtos")
def listar_produtos():
    """Retorna uma lista com todos os produtos cadastrados no estoque, contendo informações detalhadas e o nome da sua categoria."""
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT p.id, p.nome, c.nome as categoria, p.categoria_id, p.quantidade, p.unidade_medida 
            FROM produtos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id
        """)
        produtos = cursor.fetchall()

        if not produtos:
            return JSONResponse(status_code=404, content={"message": "Nenhum produto encontrado."})
        return produtos
    finally:
        conn.close()

# Rota para buscar produto
@router.get("/produtos/{id}", summary="Consultar produto por ID")
def buscar_produto(id: int):
    """Busca as informações e detalhes de um produto específico através de seu ID numérico."""
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT p.id, p.nome, c.nome as categoria, p.quantidade, p.unidade_medida 
            FROM produtos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = %s
        """, (id,))
        produto = cursor.fetchone()

        if not produto:
            return JSONResponse(status_code=404, content={"message": "Produto nao encontrado."})
        return produto
    finally:
        conn.close()

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

    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO produtos (nome, categoria_id, quantidade, unidade_medida) VALUES (%s, %s, %s, %s)",
            (nome, categoria, quantidade, unidade_medida)
        )
        conn.commit()
        return JSONResponse(status_code=201, content={"message": "Produto adicionado com sucesso."})
    finally:
        conn.close()

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
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE produtos SET nome = %s, categoria_id = %s, quantidade = %s, unidade_medida = %s WHERE id = %s",
            (nome, categoria, quantidade, unidade_medida, id)
        )
        conn.commit()
        return {"mensagem": "Produto atualizado com sucesso!"}
    finally:
        conn.close()

# Rota para deletar produto
@router.delete("/produtos/{id}", summary="Deletar produto")
def deletar_produto(id: int):
    """Deleta permanentemente um produto do registro de estoque pelo seu ID."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM produtos WHERE id = %s", (id,))
        conn.commit()
        return {"mensagem": "Produto deletado com sucesso!"}
    finally:
        conn.close()