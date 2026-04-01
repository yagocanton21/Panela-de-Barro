import psycopg2
import psycopg2.extras
from app.database import get_connection
from passlib.context import CryptContext

# Configuração do Passlib para usar pbkdf2_sha256 e bcrypt para compatibilidade
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

# Funções de hash e verificação de senha
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Função para verificar se a senha é válida
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

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

# Função para criar um usuário
def criar_usuario(nome_exibicao, usuario, senha_pura, is_admin=False):
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

# Função para buscar um usuário pelo login
def buscar_usuario_por_login(usuario_login):
    sql = "SELECT id, nome_exibicao, usuario, senha_hash, is_admin FROM usuarios WHERE usuario = %s"
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(sql, (usuario_login,))
            return cursor.fetchone()
    finally:
        conn.close()

# Função para listar todos os usuários
def listar_usuarios():
    sql = "SELECT id, nome_exibicao, usuario, is_admin, data_criacao FROM usuarios ORDER BY id"
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        conn.close()

# Função para editar um usuario
def editar_usuario(id, nome_exibicao, usuario, senha_pura, is_admin=False):
    senha_hash = hash_password(senha_pura)
    sql = """
        UPDATE usuarios
        SET nome_exibicao = %s, usuario = %s, senha_hash = %s, is_admin = %s
        WHERE id = %s
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, (nome_exibicao, usuario, senha_hash, is_admin, id))
            conn.commit()
    finally:
        conn.close()

# Função para deletar usuario
def deletar_usuario(id):
    sql = "DELETE FROM usuarios WHERE id = %s"
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, (id,))
            conn.commit()
    finally:
        conn.close()
