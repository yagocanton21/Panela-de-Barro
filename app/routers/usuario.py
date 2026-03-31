from fastapi import APIRouter, HTTPException, Body, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from app.models.usuario import criar_usuario, buscar_usuario_por_login, verify_password, listar_usuarios, editar_usuario
from app.auth import criar_token_acesso, obter_usuario_atual
import psycopg2

router = APIRouter()

# Criar novo usuário
@router.post("/usuarios", status_code=201, summary="Criar novo usuário")
def registrar_usuario(dados: dict = Body(...)):
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

# Listar todos os usuários
@router.get("/usuarios", summary="Listar todos os usuários")
def get_usuarios(user: dict = Depends(obter_usuario_atual)):
    usuarios = listar_usuarios()
    if not usuarios:
        return JSONResponse(status_code=404, content={"message": "Nenhum usuário encontrado."})
    return usuarios

# Autenticar usuário
@router.post("/login", summary="Autenticar usuário")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    usuario_login = form_data.username
    senha_pura = form_data.password

    db_user = buscar_usuario_por_login(usuario_login)

    if not db_user or not verify_password(senha_pura, db_user["senha_hash"]):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos.")
    
    # Gera o token guardando o usuario e id
    access_token = criar_token_acesso(dados={
        "sub": db_user["usuario"],
        "id": db_user["id"],
        "is_admin": db_user["is_admin"]
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": db_user["id"],
            "nome": db_user["nome_exibicao"],
            "usuario": db_user["usuario"],
            "is_admin": db_user["is_admin"]
        }
    }

# Editar usuário
@router.put("/usuarios/{id}", summary="Editar usuário")
def update_usuario(id: int, dados: dict = Body(...), user: dict = Depends(obter_usuario_atual)):
    try:
        nome_exibicao = dados.get("nome_exibicao")
        usuario = dados.get("usuario")
        senha = dados.get("senha")
        is_admin = dados.get("is_admin", False)

        editar_usuario(id, nome_exibicao, usuario, senha, is_admin)
        return {"mensagem": "Usuário editado com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao editar usuário: {str(e)}")