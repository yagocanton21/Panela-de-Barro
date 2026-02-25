from app.database import get_connection


def criar_tabela_produtos():
    """Cria a tabela 'produtos' no banco de dados, caso ela não exista."""
    sql = """
        CREATE TABLE IF NOT EXISTS produtos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            categoria VARCHAR(100),
            preco_custo FLOAT,
            quantidade INTEGER DEFAULT 0,
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
