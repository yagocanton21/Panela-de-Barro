from app.database import get_connection

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
