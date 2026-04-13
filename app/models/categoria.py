from app.database import get_connection
import psycopg2.extras

categorias = [
    "Carnes",
    "Vegetais",
    "Bebidas",
    "Grãos",
    "Temperos",
]

# Função para criar a tabela de categorias
def criar_tabela_categorias():
    """Cria a tabela 'categorias' e insere as categorias pré-definidas."""
    conn = get_connection()
    try:
        cursor = conn.cursor()

        # Cria a tabela
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS categorias (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL UNIQUE
            );
        """)

        # Insere as categorias iniciais (ignora duplicatas)
        for categoria in categorias:
            cursor.execute(
                "INSERT INTO categorias (nome) VALUES (%s) ON CONFLICT (nome) DO NOTHING",
                (categoria,)
            )

        conn.commit()
    finally:
        conn.close()

# Listar categorias
def listar_categorias_db():
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM categorias ORDER BY id")
        return cursor.fetchall()
    finally:
        conn.close()

# Buscar categoria por id
def buscar_categoria_db(id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM categorias WHERE id = %s", (id,))
        return cursor.fetchone()
    finally:
        conn.close()

# Buscar categorias
def buscar_categoria_por_nome_db(nome: str):
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM categorias WHERE nome = %s", (nome,))
        return cursor.fetchone()
    finally:
        conn.close()

# Adicionar categoria
def adicionar_categoria_db(nome: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO categorias (nome) VALUES (%s)", (nome,))
        conn.commit()
        return True
    finally:
        conn.close()

# Editar categoria
def editar_categoria_db(id: int, nome: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE categorias SET nome = %s WHERE id = %s", (nome, id))
        conn.commit()
        return True
    finally:
        conn.close()

# Deletar categoria
def deletar_categoria_db(id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM categorias WHERE id = %s", (id,))
        conn.commit()
        return True
    finally:
        conn.close()

