import httpx
import pytest
from app.main import app

# Configuração para o pytest-asyncio
pytestmark = pytest.mark.asyncio

transport = httpx.ASGITransport(app=app)
base_url = "http://testserver"

async def test_crud_produto_completo():
    async with httpx.AsyncClient(transport=transport, base_url=base_url) as client:
        # 1. Criar Produto
        novo_produto = {
            "nome": "Produto Teste CRUD",
            "categoria": 1, # Usando ID da primeira categoria (Carnes)
            "quantidade": 10,
            "unidade_medida": "UN"
        }
        response_post = await client.post("/produtos", json=novo_produto)
        assert response_post.status_code == 201
        
        # 2. Listar para achar o ID
        response_list = await client.get("/produtos")
        produtos = response_list.json()
        # No novo retorno (com JOIN), o nome da categoria vem na posição 2
        produto_criado = next(p for p in produtos if p[1] == "Produto Teste CRUD")
        produto_id = produto_criado[0]
        
        # 3. Buscar por ID
        response_get = await client.get(f"/produtos/{produto_id}")
        assert response_get.status_code == 200
        
        # 4. Editar Produto
        produto_editado = {**novo_produto, "nome": "Produto Teste Alterado"}
        response_put = await client.put(f"/produtos/{produto_id}", json=produto_editado)
        assert response_put.status_code == 200
        
        # 5. Deletar Produto
        response_delete = await client.delete(f"/produtos/{produto_id}")
        assert response_delete.status_code == 200
        
        # 6. Verificar se sumiu (deve dar 404 agora)
        response_final = await client.get(f"/produtos/{produto_id}")
        assert response_final.status_code == 404
