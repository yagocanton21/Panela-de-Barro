from pydantic import BaseModel, ConfigDict
from typing import Optional

# Classe para Criar Produto
class CriarProduto(BaseModel):
    nome: str
    quantidade: int
    quantidade_minima: int = 0
    categoria_id: int
    unidade_medida: str = ""

# Classe para Retornar Produto
class ProdutoResponse(BaseModel):
    id: int
    nome: str
    categoria: Optional[str] = None  # Nome da categoria (vem do JOIN)
    categoria_id: int
    quantidade: int
    quantidade_minima: int
    unidade_medida: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)