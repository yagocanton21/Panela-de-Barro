import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_crud_produto_completo():
    """Testa o ciclo de vida do produto: criar, listar, buscar, editar e deletar."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Login (Admin Default)
        login_data = {"username": "marcello", "password": "123"}
        login_res = await ac.post("/login", data=login_data)
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Criar Produto (Categoria ID 1 deve existir pelo bootstrap)
        novo_produto = {
            "nome": "Produto Teste CRUD",
            "categoria_id": 1,
            "quantidade": 10,
            "unidade_medida": "UN"
        }
        response_post = await ac.post("/produtos", json=novo_produto, headers=headers)
        assert response_post.status_code == 201
        produto_id = response_post.json()["id"]

        # 2. Listar produtos
        response_list = await ac.get("/produtos", headers=headers)
        assert response_list.status_code == 200
        
        # 3. Buscar pelo ID
        response_get = await ac.get(f"/produtos/{produto_id}", headers=headers)
        assert response_get.status_code == 200
        assert response_get.json()["nome"] == "Produto Teste CRUD"

        # 4. Editar
        dados_edit = {**novo_produto, "nome": "Produto Alterado"}
        response_put = await ac.put(f"/produtos/{produto_id}", json=dados_edit, headers=headers)
        assert response_put.status_code == 200

        # 5. Deletar
        response_del = await ac.delete(f"/produtos/{produto_id}", headers=headers)
        assert response_del.status_code == 200

        # 6. Confirmar 404
        response_final = await ac.get(f"/produtos/{produto_id}", headers=headers)
        assert response_final.status_code == 404
