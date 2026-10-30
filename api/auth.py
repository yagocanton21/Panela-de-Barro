import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from api.database import get_connection
from api.models.usuario import Usuario

load_dotenv()

# Configurações do JWT (Lidas do .env)
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY não definida no .env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

# Define onde o FastAPI deve procurar o token (no header Authorization: Bearer <token>)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def criar_token_acesso(dados: dict):
    """Gera um token JWT assinado."""
    a_copiar = dados.copy()
    expira = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    a_copiar.update({"exp": expira})
    return jwt.encode(a_copiar, SECRET_KEY, algorithm=ALGORITHM)

async def obter_usuario_atual(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_connection)):
    """Valida o token JWT e verifica a existência e o status do usuário no banco de dados."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado. Faça login novamente.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        username: str = payload.get("sub")
        if user_id is None and username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Validação ativa no banco de dados (previne uso de token após exclusão/alteração de usuário)
    if user_id is not None:
        stmt = select(Usuario).where(Usuario.id == user_id)
    else:
        stmt = select(Usuario).where(Usuario.usuario == username)

    resultado = await db.execute(stmt)
    db_user = resultado.scalars().first()
    if not db_user:
        raise credentials_exception

    return {
        "id": db_user.id,
        "sub": db_user.usuario,
        "nome_exibicao": db_user.nome_exibicao,
        "is_admin": bool(db_user.is_admin)
    }

def verificar_admin(user: dict = Depends(obter_usuario_atual)):
    """Verifica se o usuário logado possui privilégios de administrador."""
    if not user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem realizar esta operação."
        )
    return user

