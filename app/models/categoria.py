from app.database import get_connection

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

