from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from app.database import get_connection
from app.models.usuario import criar_usuario, buscar_usuario_por_login, verify_password
import psycopg2
import psycopg2.extras

router = APIRouter()

# Rota para criar um novo usuário
@router.post("/usuarios", status_code=201, summary="Criar novo usuário")
def registrar_usuario(dados: dict = Body(...)):
    """Cria um novo usuário."""
    try:
        nome_exibicao = dados.get("nome_exibicao")
        usuario = dados.get("usuario")
        senha = dados.get("senha")
        is_admin = dados.get("is_admin", False)

        criar_usuario(nome_exibicao, usuario, senha, is_admin)
        return {"mensagem": "Usuário criado com sucesso!"}
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=400, detail="Este usuário já existe.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar usuário: {str(e)}")

# Rota para listar todos os usuários
@router.get("/usuarios", summary="Listar todos os usuários")
def listar_usuarios():
    """Lista todos os usuários."""
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT id, nome_exibicao, usuario, is_admin, data_criacao FROM usuarios ORDER BY id")
        usuarios = cursor.fetchall()
        if not usuarios:
            return JSONResponse(status_code=404, content={"message": "Nenhum usuário encontrado."})
        return usuarios
    finally:
        conn.close()

# Rota de login
@router.post("/login", summary="Autenticar usuário")
def login(dados: dict = Body(...)):
    usuario_login = dados.get("usuario")
    senha_pura = dados.get("senha")

    # 1. Busca o usuário no banco
    db_user = buscar_usuario_por_login(usuario_login)

    # 2. Verifica se o usuário existe e se a senha está correta
    if not db_user or not verify_password(senha_pura, db_user["senha_hash"]):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos.")

    # 3. Se estiver tudo certo, retornamos os dados (por enquanto sem JWT para simplificar)
    return {
        "mensagem": "Login realizado com sucesso!",
        "usuario": {
            "id": db_user["id"],
            "nome": db_user["nome_exibicao"],
            "usuario": db_user["usuario"],
            "is_admin": db_user["is_admin"]
        }
    }
