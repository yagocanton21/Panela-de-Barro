from fastapi import APIRouter, Body, Depends
from fastapi.responses import JSONResponse
from app.database import get_connection
from app.auth import obter_usuario_atual
import psycopg2.extras

router = APIRouter(prefix="/movimentacoes", dependencies=[Depends(obter_usuario_atual)])

# Rota para listar as movimentações
@router.get("", summary="Listar o histórico de movimentações")
def listar_movimentacoes():
    """Lista todas as movimentações."""
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT m.*, p.nome as produto_nome 
            FROM movimentacoes m
            LEFT JOIN produtos p ON m.produto_id = p.id
            ORDER BY m.data_hora DESC
        """)
        movimentacoes = cursor.fetchall()
        return movimentacoes if movimentacoes else []
    finally:
        conn.close()

# Rota para criar uma movimentação com atualização automática de estoque
@router.post("", status_code=201, summary="Registrar entrada ou saída de produto")
def criar_movimentacao(produto_id: int = Body(...), tipo: str = Body(..., description="Deve ser 'entrada' ou 'saida'"), quantidade: int = Body(...), motivo: str = Body(...)):
    """Cria uma nova movimentação e atualiza o saldo do produto."""
    
    if quantidade <= 0:
        return JSONResponse(status_code=400, content={"message": "A quantidade deve ser maior que zero."})
        
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Verificar se o produto existe e pegar o saldo atual
        cursor.execute("SELECT quantidade FROM produtos WHERE id = %s", (produto_id,))
        resultado = cursor.fetchone()
        if not resultado:
            return JSONResponse(status_code=404, content={"message": "Produto não encontrado."})
        
        estoque_atual = resultado[0]
        
        # Calcular o novo saldo
        if tipo == 'entrada':
            novo_estoque = estoque_atual + quantidade
        elif tipo == 'saida':
            if estoque_atual < quantidade:
                return JSONResponse(status_code=400, content={"message": "Estoque insuficiente!"})
            novo_estoque = estoque_atual - quantidade
        else:
            return JSONResponse(status_code=400, content={"message": "Tipo inválido. Use 'entrada' ou 'saida'."})

        # Atualizar produto
        cursor.execute("UPDATE produtos SET quantidade = %s WHERE id = %s", (novo_estoque, produto_id))
        
        # Registrar o histórico da movimentação
        cursor.execute(
            "INSERT INTO movimentacoes (produto_id, tipo, quantidade, motivo) VALUES (%s, %s, %s, %s)", 
            (produto_id, tipo, quantidade, motivo)
        )
        
        conn.commit()
        return {"mensagem": f"Movimentação de {tipo} realizada! Novo saldo: {novo_estoque}"}
    except Exception as e:
        conn.rollback()
        return JSONResponse(status_code=500, content={"message": f"Erro: {str(e)}"})
    finally:
        conn.close()

# Rota para buscar uma movimentação pelo ID
@router.get("/{id}", summary="Consultar uma movimentação por ID")
def buscar_movimentacao(id: int):
    """Busca uma movimentação pelo ID."""
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM movimentacoes WHERE id = %s", (id,))
        movimentacao = cursor.fetchone()
        if not movimentacao:
            return JSONResponse(status_code=404, content={"message": "Movimentação não encontrada."})
        return movimentacao
    finally:
        conn.close()

# Rota para deletar uma movimentação
@router.delete("/{id}", summary="Deletar registro de movimentação")
def deletar_movimentacao(id: int):
    """Deleta uma movimentação pelo ID."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM movimentacoes WHERE id = %s", (id,))
        conn.commit()
        return {"mensagem": "Movimentação deletada com sucesso!"}
    finally:
        conn.close()
