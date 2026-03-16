from app.database import get_connection
from passlib.context import CryptContext

# Configuração do Passlib para usar bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Função para transformar senha em has
def hash_password(password: str) -> str:
    """Transforma a senha em texto puro em um hash seguro."""
    return pwd_context.hash(password)

# Função para verificar se a senha esta correta
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha digitada bate com o hash salvo."""
    return pwd_context.verify(plain_password, hashed_password)

# Função para criar a tabela de usuários
def criar_tabela_usuarios():
    sql = """
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome_exibicao VARCHAR(255) NOT NULL,
            usuario VARCHAR(50) UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
            conn.commit()
    finally:
        conn.close()

# Função para criar um novo usuário
def criar_usuario(nome_exibicao, usuario, senha_pura, is_admin=False):
    """Cria um novo usuário com a senha criptografada."""
    senha_hash = hash_password(senha_pura)
    sql = """
        INSERT INTO usuarios (nome_exibicao, usuario, senha_hash, is_admin)
        VALUES (%s, %s, %s, %s)
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, (nome_exibicao, usuario, senha_hash, is_admin))
            conn.commit()
    finally:
        conn.close()
