from pydantic import BaseModel, ConfigDict, model_validator
from typing import Optional
from datetime import datetime

# Modelo base para itens da lista de compras
class ItemListaBase(BaseModel):
    produto_id: Optional[int] = None
    nome_avulso: Optional[str] = None
    quantidade: int = 1
    comprado: bool = False

# Modelo para criar itens na lista de compras
class CriarItemLista(ItemListaBase):
    @model_validator(mode="after")
    def precisa_produto_ou_nome(self):
        if not self.produto_id and not self.nome_avulso:
            raise ValueError("produto_id ou nome_avulso é obrigatório")
        return self

# Modelo para retornar itens da lista de compras
class ItemListaResponse(ItemListaBase):
    id: int
    data_criacao: datetime
    nome_produto: Optional[str] = None # Para mostrar o nome quando vier do estoque

    model_config = ConfigDict(from_attributes=True)
