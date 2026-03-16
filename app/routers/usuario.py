from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from app.database import get_connection
from app.models.usuario import criar_usuario
import psycopg2
import psycopg2.extras

router = APIRouter()

# Rota para criar um novo usuário
@router.post("/usuarios", status_code=201, summary="Criar novo usuário")
def registrar_usuario(
    nome_exibicao: str = Body(...),
    usuario: str = Body(...),
    senha: str = Body(...),
    is_admin: bool = Body(False)
):
    """Cria um novo usuário."""
    try:
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
