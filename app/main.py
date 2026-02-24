from fastapi import FastAPI
from app.database import engine, Base

# Cria as tabelas no banco de dados, caso elas não existam (apenas para ambiente de dev)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Panela de Barro - API de Estoque")

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API de Estoque do Restaurante Panela de Barro!"}
