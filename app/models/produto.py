from app.database import get_connection
import psycopg2.extras

# Produtos de exemplo para popular o banco de dados na inicialização
# Formato: (nome, nome_categoria, quantidade, unidade_medida)
PRODUTOS_INICIAIS = [
    # Carnes
    ("Frango Inteiro",        "Carnes",    25,  "kg"),
    ("Costela Bovina",        "Carnes",    18,  "kg"),
    ("Linguiça Calabresa",    "Carnes",    30,  "kg"),
    ("Filé de Peixe",         "Carnes",    12,  "kg"),
    ("Carne Moída",           "Carnes",     8,  "kg"),
    # Vegetais
    ("Cebola",                "Vegetais",  40,  "kg"),
    ("Alho",                  "Vegetais",  15,  "kg"),
    ("Tomate",                "Vegetais",  22,  "kg"),
    ("Batata-Doce",           "Vegetais",  35,  "kg"),
    ("Pimentão Vermelho",     "Vegetais",   5,  "kg"),
    ("Cenoura",               "Vegetais",  20,  "kg"),
    ("Couve",                 "Vegetais",   9,  "kg"),
    # Bebidas
    ("Água Mineral (500ml)",  "Bebidas",  120,  "un"),
    ("Suco de Laranja",       "Bebidas",   48,  "l"),
    ("Refrigerante Cola 2L",  "Bebidas",   36,  "un"),
    ("Cerveja Artesanal",     "Bebidas",   24,  "un"),
    # Grãos
    ("Arroz Agulhinha",       "Grãos",     50,  "kg"),
    ("Feijão Carioca",        "Grãos",     30,  "kg"),
    ("Lentilha",              "Grãos",     10,  "kg"),
    ("Fubá de Milho",         "Grãos",      7,  "kg"),
    ("Farinha de Mandioca",   "Grãos",     25,  "kg"),
    # Temperos
    ("Sal Grosso",            "Temperos",  15,  "kg"),
    ("Pimenta-do-Reino",      "Temperos",   3,  "kg"),
    ("Colorau",               "Temperos",   6,  "kg"),
    ("Louro em Folha",        "Temperos",   2,  "kg"),
    ("Coentro Seco",          "Temperos",   4,  "kg"),
]

# Função para criar a tabela de produtos
def criar_tabela_produtos():
    """Cria a tabela 'produtos' no banco de dados, caso ela não exista, e popula com dados iniciais."""
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

        # Insere os produtos iniciais apenas se a tabela estiver vazia
        cursor.execute("SELECT COUNT(*) FROM produtos")
        total = cursor.fetchone()[0]

        if total == 0:
            for nome, categoria_nome, quantidade, unidade in PRODUTOS_INICIAIS:
                cursor.execute(
                    """
                    INSERT INTO produtos (nome, categoria_id, quantidade, unidade_medida)
                    SELECT %s, id, %s, %s FROM categorias WHERE nome = %s
                    """,
                    (nome, quantidade, unidade, categoria_nome)
                )

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
def adicionar_produto_db(nome, categoria_id, quantidade, quantidade_minima, unidade_medida):
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
def editar_produto_db(id, nome, categoria_id, quantidade, quantidade_minima, unidade_medida):
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
