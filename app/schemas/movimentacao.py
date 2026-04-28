from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, Literal

# Classe base
class MovimentacaoBase(BaseModel):
    produto_id: int
    tipo: Literal["entrada", "saida"]
    quantidade: int = Field(..., gt=0)
    motivo: Optional[str] = Field(None, max_length=255)

# Classe para criar movimentação
class CriarMovimentacao(MovimentacaoBase):
    pass

# Classe para retornar movimentação
class MovimentacaoResponse(MovimentacaoBase):
    id: int
    data_hora: datetime
    produto_nome: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)