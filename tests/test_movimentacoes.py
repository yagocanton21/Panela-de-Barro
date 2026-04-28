import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_logica_estoque_movimentacao():
    """Testa o fluxo completo: criar produto e fazer entradas/saídas de estoque."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Login
        login_data = {"username": "marcello", "password": "123"}
        login_res = await ac.post("/login", data=login_data)
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Pegar categoria ID (pode ser a 1 do bootstrap)
        cat_id = 1

        # 2. Criar produto
        novo_prod = {
            "nome": "Produto Teste Mov",
            "categoria_id": cat_id,
            "quantidade": 10,
            "unidade_medida": "KG"
        }
        resp_prod = await ac.post("/produtos/", json=novo_prod, headers=headers)
        assert resp_prod.status_code == 201
        prod_id = resp_prod.json()["id"]

        # 3. Entrada (+5)
        mov_in = {"produto_id": prod_id, "tipo": "entrada", "quantidade": 5, "motivo": "Teste"}
        resp_in = await ac.post("/movimentacoes/", json=mov_in, headers=headers)
        assert resp_in.status_code == 201
        assert "15" in str(resp_in.json()["mensagem"])

        # 4. Saída (-3)
        mov_out = {"produto_id": prod_id, "tipo": "saida", "quantidade": 3, "motivo": "Teste"}
        resp_out = await ac.post("/movimentacoes/", json=mov_out, headers=headers)
        assert resp_out.status_code == 201
        assert "12" in str(resp_out.json()["mensagem"])

        # 5. Erro insuficiente
        mov_fail = {"produto_id": prod_id, "tipo": "saida", "quantidade": 100, "motivo": "Fail"}
        resp_fail = await ac.post("/movimentacoes/", json=mov_fail, headers=headers)
        assert resp_fail.status_code == 400
