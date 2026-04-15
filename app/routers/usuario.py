# app/routers/usuario.py

from fastapi import APIRouter, HTTPException, Body, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from app.models.usuario import criar_usuario, buscar_usuario_por_login, verify_password, listar_usuarios, editar_usuario, deletar_usuario
from app.auth import criar_token_acesso, obter_usuario_atual
import psycopg2

router = APIRouter() 

# Dependência de Segurança
def verificar_admin(user: dict = Depends(obter_usuario_atual)):
    """Verifica se o usuário logado possui privilégios de administrador."""
    if not user.get("is_admin"):
        raise HTTPException(
            status_code=403, 
            detail="Acesso negado. Apenas administradores podem realizar esta operação."
        )
    return user

# Rotas
@router.post("/usuarios", status_code=201, summary="Criar novo usuário")
def registrar_usuario(dados: dict = Body(...), current_user: dict = Depends(verificar_admin)):
    # Apenas admins podem criar usuários
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
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno no servidor ao processar solicitação")

@router.get("/usuarios", summary="Listar todos os usuários")
def get_usuarios(user: dict = Depends(verificar_admin)):
    # Apenas admins podem ver a lista de usuários
    usuarios = listar_usuarios()
    if not usuarios:
        return JSONResponse(status_code=404, content={"message": "Nenhum usuário encontrado."})
    return usuarios

@router.post("/login", summary="Autenticar usuário")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Esta rota continua pública para permitir o acesso inicial
    usuario_login = form_data.username
    senha_pura = form_data.password

    db_user = buscar_usuario_por_login(usuario_login)

    if not db_user or not verify_password(senha_pura, db_user["senha_hash"]):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos.")
    
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

@router.put("/usuarios/{id}", summary="Editar usuário")
def update_usuario(id: int, dados: dict = Body(...), user: dict = Depends(verificar_admin)):
    # Apenas admins podem editar
    try:
        nome_exibicao = dados.get("nome_exibicao")
        usuario = dados.get("usuario")
        senha = dados.get("senha")
        is_admin = dados.get("is_admin", False)

        editar_usuario(id, nome_exibicao, usuario, senha, is_admin)
        return {"mensagem": "Usuário editado com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno no servidor ao processar solicitação")

@router.delete("/usuarios/{id}", summary="Deletar usuário")
def excluir_usuario(id: int, user: dict = Depends(verificar_admin)):
    # Apenas admins podem deletar
    try:
        deletar_usuario(id)
        return {"mensagem": "Usuário deletado com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno no servidor ao processar solicitação")
