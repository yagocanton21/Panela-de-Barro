from pydantic import BaseModel, ConfigDict, Field

# Classe Base   
class CategoriaBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=100)

# Classe para criar categoria
class CategoriaCreate(CategoriaBase):
    pass

# Classe para retornar categoria
class CategoriaResponse(CategoriaBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)


