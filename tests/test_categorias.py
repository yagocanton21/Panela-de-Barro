import httpx
import pytest
from app.main import app

# Configura o pytest para rodar testes assíncronos
pytestmark = pytest.mark.asyncio

transport = httpx.ASGITransport(app=app)
base_url = "http://testserver"

async def obter_token(client):
    """Função auxiliar para garantir que o usuário existe e pegar o token"""
    user_data = {
        "nome_exibicao": "Marcello Teste",
        "usuario": "marcello",
        "senha": "1234",
        "is_admin": True
    }
    # Tenta criar o usuário (ignora erro se já existir)
    await client.post("/usuarios", json=user_data)
    
    # Faz o login
    login_data = {"username": "marcello", "password": "1234"}
    response = await client.post("/login", data=login_data)
    
    if response.status_code != 200:
        print(f"Erro no login: {response.json()}")
        return None
        
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
