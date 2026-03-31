import httpx
import pytest
from app.main import app

# Configura o pytest para rodar testes assíncronos
pytestmark = pytest.mark.asyncio

transport = httpx.ASGITransport(app=app)
base_url = "http://testserver"

async def obter_token(client):
    """Função auxiliar para logar e pegar o token de acesso"""
    login_data = {"username": "marcello", "password": "1234"}
    response = await client.post("/login", data=login_data)
    return response.json()["access_token"]

async def test_categorias_seed_inicial():
    """Verifica se as categorias iniciais (Carnes, Bebidas, etc) foram criadas"""
    async with httpx.AsyncClient(transport=transport, base_url=base_url) as client:
        token = await obter_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = await client.get("/categorias", headers=headers)
        assert response.status_code == 200
        
        categorias = response.json()
        nomes_categorias = [c['nome'] for c in categorias]
        
        assert "Carnes" in nomes_categorias
        assert "Bebidas" in nomes_categorias

async def test_buscar_categoria_por_nome():
    """Verifica se é possível achar uma categoria pelo nome"""
    async with httpx.AsyncClient(transport=transport, base_url=base_url) as client:
        token = await obter_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = await client.get("/categorias/Carnes", headers=headers)
        assert response.status_code == 200
        assert response.json()['nome'] == "Carnes"
