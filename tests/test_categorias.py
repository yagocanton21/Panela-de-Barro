import httpx
import pytest
from app.main import app

# Configura o pytest para rodar testes assíncronos
pytestmark = pytest.mark.asyncio

transport = httpx.ASGITransport(app=app)
base_url = "http://testserver"

async def test_categorias_seed_inicial():
    """Verifica se as categorias iniciais (Carnes, Bebidas, etc) foram criadas"""
    async with httpx.AsyncClient(transport=transport, base_url=base_url) as client:
        response = await client.get("/categorias")
        assert response.status_code == 200
        
        categorias = response.json()
        # Agora usamos 'nome' em vez de índice [1]
        nomes_categorias = [c['nome'] for c in categorias]
        
        assert "Carnes" in nomes_categorias
        assert "Bebidas" in nomes_categorias

async def test_buscar_categoria_por_nome():
    """Verifica se é possível achar uma categoria pelo nome"""
    async with httpx.AsyncClient(transport=transport, base_url=base_url) as client:
        response = await client.get("/categorias/Carnes")
        assert response.status_code == 200
        # Agora usamos 'nome' em vez de índice [1]
        assert response.json()['nome'] == "Carnes"
