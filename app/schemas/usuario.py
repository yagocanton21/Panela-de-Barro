from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Classe para Criar Usuário
class CriarUsuario(BaseModel):
    nome_exibicao: str
    usuario: str
    senha: str
    is_admin: bool = False

# Classe para Retornar Usuário
class UsuarioResponse(BaseModel):
    id: int
    nome_exibicao: str
    usuario: str
    is_admin: bool
    data_criacao: datetime
    model_config = ConfigDict(from_attributes=True)
