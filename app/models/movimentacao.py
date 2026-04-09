from app.database import get_connection
import psycopg2.extras

# Função para criar a tabela de movimentações
def criar_tabela_movimentacoes():
    """Cria a tabela 'movimentacoes' no banco de dados, caso ela não exista."""
    sql = """
        CREATE TABLE IF NOT EXISTS movimentacoes (
            id SERIAL PRIMARY KEY,
            produto_id INTEGER NOT NULL,
            tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
            quantidade INTEGER NOT NULL,
            data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            motivo TEXT,
            FOREIGN KEY (produto_id) REFERENCES produtos (id) ON DELETE CASCADE
        );
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(sql)
        conn.commit()
    finally:
        conn.close()

# Listar movimentações
def listar_movimentacoes_db():
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT m.*, p.nome as produto_nome 
            FROM movimentacoes m
            LEFT JOIN produtos p ON m.produto_id = p.id
            ORDER BY m.data_hora DESC
        """)
        return cursor.fetchall()
    finally:
        conn.close()

def buscar_movimentacao_db(id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM movimentacoes WHERE id = %s", (id,))
        return cursor.fetchone()
    finally:
        conn.close()

def registrar_movimentacao_db(produto_id: int, tipo: str, quantidade: int, motivo: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Verificar se o produto existe e pegar o saldo atual
        cursor.execute("SELECT quantidade FROM produtos WHERE id = %s", (produto_id,))
        resultado = cursor.fetchone()
        if not resultado:
            return False, "Produto não encontrado."
        
        estoque_atual = resultado[0]
        
        # Calcular o novo saldo
        if tipo == 'entrada':
            novo_estoque = estoque_atual + quantidade
        elif tipo == 'saida':
            if estoque_atual < quantidade:
                return False, "Estoque insuficiente!"
            novo_estoque = estoque_atual - quantidade
        else:
            return False, "Tipo inválido. Use 'entrada' ou 'saida'."

        # Atualizar produto
        cursor.execute("UPDATE produtos SET quantidade = %s WHERE id = %s", (novo_estoque, produto_id))
        
        # Registrar o histórico da movimentação
        cursor.execute(
            "INSERT INTO movimentacoes (produto_id, tipo, quantidade, motivo) VALUES (%s, %s, %s, %s)", 
            (produto_id, tipo, quantidade, motivo)
        )
        
        conn.commit()
        return True, novo_estoque
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def deletar_movimentacao_db(id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM movimentacoes WHERE id = %s", (id,))
        conn.commit()
        return True
    finally:
        conn.close()
