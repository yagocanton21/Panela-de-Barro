from pydantic import BaseModel, ConfigDict

# Molde para CRIAR ou EDITAR categoria
class CategoriaCreate(BaseModel):
    nome: str

# Molde para RESPONDER com uma categoria 
class CategoriaResponse(BaseModel):
    id: int
    nome: str
    model_config = ConfigDict(from_attributes=True)

