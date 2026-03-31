import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv

load_dotenv()

# Configurações do JWT (Lidas do .env)
SECRET_KEY = os.getenv("SECRET_KEY", "chave_padrao_muito_longa_e_segura")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

# Define onde o FastAPI deve procurar o token (no header Authorization: Bearer <token>)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def criar_token_acesso(dados: dict):
    """Gera um token JWT assinado."""
    a_copiar = dados.copy()
    expira = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    a_copiar.update({"exp": expira})
    return jwt.encode(a_copiar, SECRET_KEY, algorithm=ALGORITHM)

def obter_usuario_atual(token: str = Depends(oauth2_scheme)):
    """Valida o token e retorna os dados do usuário logado."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado. Faça login novamente.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario: str = payload.get("sub") # 'sub' é o padrão para o identificador do usuário
        if usuario is None:
            raise credentials_exception
        return payload # Retorna os dados que você guardou no token
    except JWTError:
        raise credentials_exception
