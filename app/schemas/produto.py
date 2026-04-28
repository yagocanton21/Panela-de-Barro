from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List

# Schema base para compartilhar campos comuns
class ProdutoBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=255)
    quantidade: int = Field(..., ge=0)
    quantidade_minima: int = Field(0, ge=0)
    categoria_id: int
    unidade_medida: Optional[str] = Field("", max_length=50)

# Schema para Criar/Atualizar Produto
class CriarProduto(ProdutoBase):
    pass

# Schema para Retornar Produto (Diferencia Saída de Entrada)
class ProdutoResponse(ProdutoBase):
    id: int
    categoria: Optional[str] = None  # Nome da categoria vindo do JOIN
    
    model_config = ConfigDict(from_attributes=True)

# Schema genérico para mensagens de sucesso
class MessageResponse(BaseModel):
    message: str