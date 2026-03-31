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

async def test_logica_estoque_movimentacao():
    """Testa o fluxo completo: criar produto e fazer entradas/saídas de estoque"""
    async with httpx.AsyncClient(transport=transport, base_url=base_url) as client:
        token = await obter_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        
        # 1. Busca as categorias para pegar um ID válido
        resp_cat = await client.get("/categorias", headers=headers)
        categorias = resp_cat.json()
        cat_id = categorias[0]['id'] # Usa a chave 'id'

        # 2. Cria um produto de teste
        novo_produto = {
            "nome": "Produto Teste Estoque",
            "categoria": cat_id,
            "quantidade": 10,
            "unidade_medida": "KG"
        }
        resp_prod = await client.post("/produtos", json=novo_produto, headers=headers)
        assert resp_prod.status_code == 201
        
        # 3. Busca o ID do produto que acabou de ser criado
        resp_list = await client.get("/produtos", headers=headers)
        produtos = resp_list.json()
        produto_criado = next(p for p in produtos if p['nome'] == "Produto Teste Estoque")
        prod_id = produto_criado['id']

        # 4. Testa Entrada de Estoque (+5)
        mov_entrada = {
            "produto_id": prod_id,
            "tipo": "entrada",
            "quantidade": 5,
            "motivo": "Compra fornecedor"
        }
        resp_mov = await client.post("/movimentacoes", json=mov_entrada, headers=headers)
        assert resp_mov.status_code == 201
        assert "Novo saldo: 15" in resp_mov.json()["mensagem"]

        # 5. Testa Saída de Estoque (-3)
        mov_saida = {
            "produto_id": prod_id,
            "tipo": "saida",
            "quantidade": 3,
            "motivo": "Uso na cozinha"
        }
        resp_mov_saida = await client.post("/movimentacoes", json=mov_saida, headers=headers)
        assert resp_mov_saida.status_code == 201
        assert "Novo saldo: 12" in resp_mov_saida.json()["mensagem"]

        # 6. Testa erro quando tenta tirar mais do que tem
        mov_insuficiente = {
            "produto_id": prod_id,
            "tipo": "saida",
            "quantidade": 20,
            "motivo": "Erro teste"
        }
        resp_erro = await client.post("/movimentacoes", json=mov_insuficiente, headers=headers)
        assert resp_erro.status_code == 400
        assert "Estoque insuficiente" in resp_erro.json()["message"]
