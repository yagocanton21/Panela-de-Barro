from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from api.database import get_connection
from api.auth import criar_token_acesso, obter_usuario_atual
from api.models.usuario import Usuario, hash_password, verify_password
from api.schemas.usuario import CriarUsuario, EditarUsuario, UsuarioResponse
from api.schemas.produto import MessageResponse
from typing import List

router = APIRouter(
    tags=["Usuários"]
)

# Dependência de Segurança
def verificar_admin(user: dict = Depends(obter_usuario_atual)):
    """Verifica se o usuário logado possui privilégios de administrador."""
    if not user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Acesso negado. Apenas administradores podem realizar esta operação."
        )
    return user

# Rota para criar novo usuário
@router.post("/usuarios", response_model=MessageResponse, status_code=status.HTTP_201_CREATED, summary="Criar novo usuário")
async def registrar_usuario(dados: CriarUsuario, db: AsyncSession = Depends(get_connection), current_user: dict = Depends(verificar_admin)):
    """Apenas admins podem criar novos usuários."""
    try:
        novo = Usuario(
            nome_exibicao=dados.nome_exibicao,
            usuario=dados.usuario,
            senha_hash=hash_password(dados.senha),
            is_admin=dados.is_admin
        )
        db.add(novo)
        await db.commit()
        return {"message": "Usuário criado com sucesso!"}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Este usuário já existe.")

# Rota para listar todos os usuários
@router.get("/usuarios", response_model=List[UsuarioResponse], summary="Listar todos os usuários")
async def get_usuarios(db: AsyncSession = Depends(get_connection), user: dict = Depends(verificar_admin)):
    """Retorna a lista de todos os usuários cadastrados."""
    resultado = await db.execute(select(Usuario).order_by(Usuario.id))
    usuarios = resultado.scalars().all()
    return usuarios

# Rota para autenticar usuário
@router.post("/login", summary="Autenticar usuário")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_connection)):
    """Autenticação via OAuth2 para obtenção de token JWT."""
    usuario_login = form_data.username.strip()
    senha_pura = form_data.password

    resultado = await db.execute(select(Usuario).where(Usuario.usuario == usuario_login))
    db_user = resultado.scalars().first()

    if not db_user or not verify_password(senha_pura, db_user.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário ou senha incorretos.")
    
    access_token = criar_token_acesso(dados={
        "sub": db_user.usuario,
        "id": db_user.id,
        "is_admin": db_user.is_admin
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": db_user.id,
            "nome": db_user.nome_exibicao,
            "usuario": db_user.usuario,
            "is_admin": db_user.is_admin
        }
    }

# Rota para editar usuário
@router.put("/usuarios/{id}", response_model=MessageResponse, summary="Editar usuário")
async def update_usuario(id: int, dados: EditarUsuario, db: AsyncSession = Depends(get_connection), user: dict = Depends(verificar_admin)):
    """Atualiza os dados de um usuário existente. Senha é opcional — se omitida, mantém a atual."""
    resultado = await db.execute(select(Usuario).where(Usuario.id == id))
    usuario = resultado.scalars().first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    try:
        usuario.nome_exibicao = dados.nome_exibicao
        usuario.usuario = dados.usuario
        if dados.senha:
            usuario.senha_hash = hash_password(dados.senha)
        usuario.is_admin = dados.is_admin
        await db.commit()
        return {"message": "Usuário editado com sucesso!"}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Este nome de usuário já está em uso.")

# Rota para deletar usuário
@router.delete("/usuarios/{id}", response_model=MessageResponse, summary="Deletar usuário")
async def excluir_usuario(id: int, db: AsyncSession = Depends(get_connection), user: dict = Depends(verificar_admin)):
    """Deleta permanentemente um usuário. Bloqueia auto-exclusão e exclusão do último admin."""
    if user.get("id") == id:
        raise HTTPException(status_code=400, detail="Não é possível deletar o próprio usuário.")

    resultado = await db.execute(select(Usuario).where(Usuario.id == id))
    usuario = resultado.scalars().first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    if usuario.is_admin:
        admins_restantes = await db.execute(
            select(Usuario).where(Usuario.is_admin == True, Usuario.id != id)
        )
        if not admins_restantes.scalars().first():
            raise HTTPException(status_code=400, detail="Não é possível deletar o último administrador.")

    await db.delete(usuario)
    await db.commit()
    return {"message": "Usuário deletado com sucesso!"}

