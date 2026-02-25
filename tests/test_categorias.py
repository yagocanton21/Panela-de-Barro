import httpx
import pytest
from app.main import app

pytestmark = pytest.mark.asyncio

transport = httpx.ASGITransport(app=app)
base_url = "http://testserver"

async def test_categorias_seed_inicial():
    async with httpx.AsyncClient(transport=transport, base_url=base_url) as client:
        response = await client.get("/categorias")
        assert response.status_code == 200
        categorias = response.json()
        nomes_categorias = [c[1] for c in categorias]
        assert "Carnes" in nomes_categorias
        assert "Bebidas" in nomes_categorias

async def test_buscar_categoria_por_nome():
    async with httpx.AsyncClient(transport=transport, base_url=base_url) as client:
        response = await client.get("/categorias/Carnes")
        assert response.status_code == 200
        assert response.json()[1] == "Carnes"
