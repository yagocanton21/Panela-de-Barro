import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_categorias_seed_inicial():
    """Verifica se as categorias iniciais foram criadas pelo bootstrap."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Marcello é o admin padrão criado no startup
        login_data = {"username": "marcello", "password": "123"}
        login_res = await ac.post("/login", data=login_data)
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = await ac.get("/categorias/", headers=headers)
        assert response.status_code == 200
        categorias = response.json()
        nomes = [c["nome"] for c in categorias]
        assert "Marmitas" in nomes or "Carnes" in nomes

@pytest.mark.asyncio
async def test_buscar_categoria_por_nome():
    """Verifica busca de categoria específica."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_data = {"username": "marcello", "password": "123"}
        login_res = await ac.post("/login", data=login_data)
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Busca categoria (nome exato)
        response = await ac.get("/categorias/Marmitas", headers=headers)
        if response.status_code == 404:
             response = await ac.get("/categorias/Carnes", headers=headers)
             
        assert response.status_code == 200
