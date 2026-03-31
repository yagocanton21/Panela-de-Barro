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

async def test_crud_produto_completo():
    """Testa o ciclo de vida do produto: criar, listar, buscar, editar e deletar"""
    async with httpx.AsyncClient(transport=transport, base_url=base_url) as client:
        token = await obter_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        
        # 1. Criar Produto
        novo_produto = {
            "nome": "Produto Teste CRUD",
            "categoria": 1,
            "quantidade": 10,
            "unidade_medida": "UN"
        }
        response_post = await client.post("/produtos", json=novo_produto, headers=headers)
        assert response_post.status_code == 201
        
        # 2. Listar produtos e achar o ID do novo produto
        response_list = await client.get("/produtos", headers=headers)
        produtos = response_list.json()
        produto_criado = next(p for p in produtos if p['nome'] == "Produto Teste CRUD")
        produto_id = produto_criado['id']
        
        # 3. Buscar o produto pelo ID
        response_get = await client.get(f"/produtos/{produto_id}", headers=headers)
        assert response_get.status_code == 200
        assert response_get.json()['nome'] == "Produto Teste CRUD"
        
        # 4. Editar o nome do produto
        produto_editado = {**novo_produto, "nome": "Produto Teste Alterado"}
        response_put = await client.put(f"/produtos/{produto_id}", json=produto_editado, headers=headers)
        assert response_put.status_code == 200
        
        # 5. Deletar o produto
        response_delete = await client.delete(f"/produtos/{produto_id}", headers=headers)
        assert response_delete.status_code == 200
        
        # 6. Confirmar que o produto não existe mais (404)
        response_final = await client.get(f"/produtos/{produto_id}", headers=headers)
        assert response_final.status_code == 404
