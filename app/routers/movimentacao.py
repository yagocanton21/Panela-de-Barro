from fastapi import APIRouter, Body, Depends
from fastapi.responses import JSONResponse
from app.auth import obter_usuario_atual
from app.models.movimentacao import (
    listar_movimentacoes_db, 
    buscar_movimentacao_db, 
    registrar_movimentacao_db, 
    deletar_movimentacao_db
)

router = APIRouter(prefix="/movimentacoes", dependencies=[Depends(obter_usuario_atual)])

# Rota para listar as movimentações
@router.get("", summary="Listar o histórico de movimentações")
def listar_movimentacoes():
    """Lista todas as movimentações."""
    movimentacoes = listar_movimentacoes_db()
    return movimentacoes if movimentacoes else []

# Rota para criar uma movimentação com atualização automática de estoque
@router.post("", status_code=201, summary="Registrar entrada ou saída de produto")
def criar_movimentacao(produto_id: int = Body(...), tipo: str = Body(..., description="Deve ser 'entrada' ou 'saida'"), quantidade: int = Body(...), motivo: str = Body(...)):
    """Cria uma nova movimentação e atualiza o saldo do produto."""
    
    if quantidade <= 0:
        return JSONResponse(status_code=400, content={"message": "A quantidade deve ser maior que zero."})
        
    try:
        sucesso, resultado = registrar_movimentacao_db(produto_id, tipo, quantidade, motivo)
        
        if not sucesso:
            if "não encontrado" in resultado:
                return JSONResponse(status_code=404, content={"message": resultado})
            return JSONResponse(status_code=400, content={"message": resultado})
            
        return {"mensagem": f"Movimentação de {tipo} realizada! Novo saldo: {resultado}"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Erro: {str(e)}"})

# Rota para buscar uma movimentação pelo ID
@router.get("/{id}", summary="Consultar uma movimentação por ID")
def buscar_movimentacao(id: int):
    """Busca uma movimentação pelo ID."""
    movimentacao = buscar_movimentacao_db(id)
    if not movimentacao:
        return JSONResponse(status_code=404, content={"message": "Movimentação não encontrada."})
    return movimentacao

# Rota para deletar uma movimentação
@router.delete("/{id}", summary="Deletar registro de movimentação")
def deletar_movimentacao(id: int):
    """Deleta uma movimentação pelo ID."""
    deletar_movimentacao_db(id)
    return {"mensagem": "Movimentação deletada com sucesso!"}
