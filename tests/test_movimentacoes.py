import httpx
import pytest
from app.main import app

# Configuração para o pytest-asyncio
pytestmark = pytest.mark.asyncio

transport = httpx.ASGITransport(app=app)
base_url = "http://testserver"

async def test_logica_estoque_movimentacao():
    async with httpx.AsyncClient(transport=transport, base_url=base_url) as client:
        # 1. Criar um produto para teste
        # Precisamos de uma categoria primeiro
        resp_cat = await client.get("/categorias")
        categorias = resp_cat.json()
        cat_id = categorias[0][0] # Pega o ID da primeira categoria (Carnes, etc)

        novo_produto = {
            "nome": "Produto Teste Estoque",
            "categoria": cat_id,
            "quantidade": 10,
            "unidade_medida": "KG"
        }
        resp_prod = await client.post("/produtos", json=novo_produto)
        assert resp_prod.status_code == 201
        
        # Pegar o ID do produto criado
        resp_list = await client.get("/produtos")
        produtos = resp_list.json()
        produto_criado = next(p for p in produtos if p[1] == "Produto Teste Estoque")
        prod_id = produto_criado[0]

        # 2. Testar Entrada de Estoque (+5)
        mov_entrada = {
            "produto_id": prod_id,
            "tipo": "entrada",
            "quantidade": 5,
            "motivo": "Compra fornecedor"
        }
        resp_mov = await client.post("/movimentacoes", json=mov_entrada)
        assert resp_mov.status_code == 201
        assert "Novo saldo: 15" in resp_mov.json()["mensagem"]

        # 3. Testar Saída de Estoque (-3)
        mov_saida = {
            "produto_id": prod_id,
            "tipo": "saida",
            "quantidade": 3,
            "motivo": "Uso na cozinha"
        }
        resp_mov_saida = await client.post("/movimentacoes", json=mov_saida)
        assert resp_mov_saida.status_code == 201
        assert "Novo saldo: 12" in resp_mov_saida.json()["mensagem"]

        # 4. Testar Saída com Estoque Insuficiente (Tentar tirar 20)
        mov_insuficiente = {
            "produto_id": prod_id,
            "tipo": "saida",
            "quantidade": 20,
            "motivo": "Erro teste"
        }
        resp_erro = await client.post("/movimentacoes", json=mov_insuficiente)
        assert resp_erro.status_code == 400
        assert "Estoque insuficiente" in resp_erro.json()["message"]

        # 5. Testar Quantidade Negativa (Deve dar erro de validação)
        mov_negativa = {
            "produto_id": prod_id,
            "tipo": "entrada",
            "quantidade": -10,
            "motivo": "Erro teste"
        }
        resp_negativa = await client.post("/movimentacoes", json=mov_negativa)
        assert resp_negativa.status_code == 400
        assert "maior que zero" in resp_negativa.json()["message"]
