from pydantic import BaseModel
from typing import Optional

# Base Schema (Atributos comuns)
class ProdutoBase(BaseModel):
    nome: str
    categoria: str
    preco_custo: float
    quantidade: int = 0
    unidade_medida: str

# Schema para Criação (O que o usuário envia via POST)
class ProdutoCreate(ProdutoBase):
    pass

# Schema para Retorno (O que a API devolve, inclui o ID)
class Produto(ProdutoBase):
    id: int

    class Config:
        orm_mode = True # Permite que o Pydantic leia dados do SQLAlchemy Model
