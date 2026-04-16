from app.database import get_connection
import psycopg2.extras

# Função para criar a tabela de produtos
def criar_tabela_produtos():
    """Cria a tabela 'produtos' no banco de dados, caso ela não exista."""
    sql = """
        CREATE TABLE IF NOT EXISTS produtos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            categoria_id INTEGER REFERENCES categorias(id),
            quantidade INTEGER DEFAULT 0,
            quantidade_minima INTEGER DEFAULT 0,
            unidade_medida VARCHAR(50)
        );
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(sql)
        conn.commit()
    finally:
        conn.close()

# Listar produtos
def listar_produtos_db():
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT p.id, p.nome, c.nome as categoria, p.categoria_id, p.quantidade, p.quantidade_minima, p.unidade_medida 
            FROM produtos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id
        """)
        return cursor.fetchall()
    finally:
        conn.close()

# Buscar produtos
def buscar_produto_db(id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT p.id, p.nome, c.nome as categoria, p.quantidade, p.quantidade_minima, p.unidade_medida 
            FROM produtos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = %s
        """, (id,))
        return cursor.fetchone()
    finally:
        conn.close()

# Cadastrar produto
def adicionar_produto_db(nome, categoria_id, quantidade, quantidade_minima=0, unidade_medida=""):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO produtos (nome, categoria_id, quantidade, quantidade_minima, unidade_medida) VALUES (%s, %s, %s, %s, %s)",
            (nome, categoria_id, quantidade, quantidade_minima, unidade_medida)
        )
        conn.commit()
        return True
    finally:
        conn.close()

# Editar produto
def editar_produto_db(id, nome, categoria_id, quantidade, quantidade_minima=0, unidade_medida=""):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE produtos SET nome = %s, categoria_id = %s, quantidade = %s, quantidade_minima = %s, unidade_medida = %s WHERE id = %s",
            (nome, categoria_id, quantidade, quantidade_minima, unidade_medida, id)
        )
        conn.commit()
        return True
    finally:
        conn.close()

# Deletar produtos
def deletar_produto_db(id):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM produtos WHERE id = %s", (id,))
        conn.commit()
        return True
    finally:
        conn.close()
