from app.database import get_connection

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
