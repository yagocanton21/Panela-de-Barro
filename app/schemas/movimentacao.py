from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

# Classe para Criar Movimentação
class CriarMovimentacao(BaseModel):
    produto_id: int
    tipo: str
    quantidade: int
    motivo: str

# Classe para Retornar Movimentação
class MovimentacaoResponse(BaseModel):
    id: int
    produto_id: int
    tipo: str
    quantidade: int
    data_hora: datetime
    motivo: Optional[str] = None
    produto_nome: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)