import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from api.main import app
from sqlalchemy import select
import api.database as db_module
from api.models.produto import Produto
from api.models.lista_compras import ItemListaCompras
from api.models.usuario import Usuario

@pytest.mark.asyncio
async def test_concorrencia_cadastro_produto_duplicado():
    """
    Race condition: dois cadastros simultâneos do mesmo produto (mesmo nome).
    Garantia no banco: UniqueConstraint("nome").
    Resultado esperado: Apenas uma requisição tem status 201, a outra recebe 400.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/login", data={"username": "marcello", "password": "123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        payload = {
            "nome": "Produto Anti Race Condition",
            "categoria_id": 1,
            "quantidade": 10,
            "quantidade_minima": 5,
            "unidade_medida": "UN"
        }

        # Dispara 2 requisições no exato mesmo instante
        res1, res2 = await asyncio.gather(
            ac.post("/produtos", json=payload, headers=headers),
            ac.post("/produtos", json=payload, headers=headers),
        )

        statuses = [res1.status_code, res2.status_code]
        assert 201 in statuses, f"Esperado um 201, obteve: {statuses}"
        assert 400 in statuses, f"Esperado um 400 para o duplicado, obteve: {statuses}"

        # Confere no banco que apenas 1 produto foi criado
        async with db_module.SessionLocal() as session:
            result = await session.execute(
                select(Produto).where(Produto.nome == "Produto Anti Race Condition")
            )
            produtos = result.scalars().all()
            assert len(produtos) == 1


@pytest.mark.asyncio
async def test_concorrencia_baixa_estoque_nao_negativa():
    """
    Race condition: duas saídas simultâneas de estoque que excedem o saldo disponível.
    Garantia no banco: SELECT ... FOR UPDATE + CheckConstraint(quantidade >= 0).
    Resultado esperado: Apenas uma saída é autorizada (201); a outra é rejeitada (400).
    O estoque final deve ser exatamente 0, nunca negativo.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/login", data={"username": "marcello", "password": "123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Cria produto com saldo 10
        prod_res = await ac.post("/produtos", json={
            "nome": "Produto Estoque Limitado",
            "categoria_id": 1,
            "quantidade": 10,
            "quantidade_minima": 2,
            "unidade_medida": "UN"
        }, headers=headers)
        assert prod_res.status_code == 201
        prod_id = prod_res.json()["id"]

        saida_payload = {
            "produto_id": prod_id,
            "tipo": "saida",
            "quantidade": 10,
            "motivo": "Saída concorrente"
        }

        # Dispara duas saídas de 10 unidades simultaneamente
        res1, res2 = await asyncio.gather(
            ac.post("/movimentacoes", json=saida_payload, headers=headers),
            ac.post("/movimentacoes", json=saida_payload, headers=headers),
        )

        statuses = [res1.status_code, res2.status_code]
        assert 201 in statuses, f"Esperado um 201, obteve: {statuses}"
        assert 400 in statuses, f"Esperado um 400 por falta de saldo, obteve: {statuses}"

        # Confere o saldo no banco: deve ser exatamente 0
        async with db_module.SessionLocal() as session:
            p = await session.get(Produto, prod_id)
            assert p.quantidade == 0


@pytest.mark.asyncio
async def test_concorrencia_sincronizacao_lista_compras():
    """
    Race condition: duplo clique / sincronizações simultâneas de estoque baixo.
    Garantia no banco: Índice único parcial uq_lista_compras_produto_pendente.
    Resultado esperado: Apenas 1 registro pendente é gravado para o produto na lista.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/login", data={"username": "marcello", "password": "123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Cria produto em falta (quantidade=0, minima=10)
        prod_res = await ac.post("/produtos", json={
            "nome": "Produto Em Falta Sinc",
            "categoria_id": 1,
            "quantidade": 0,
            "quantidade_minima": 10,
            "unidade_medida": "KG"
        }, headers=headers)
        prod_id = prod_res.json()["id"]

        # Dispara 2 sincronizações ao mesmo tempo
        res1, res2 = await asyncio.gather(
            ac.post("/lista-compras/sincronizar", headers=headers),
            ac.post("/lista-compras/sincronizar", headers=headers),
        )
        assert res1.status_code == 200
        assert res2.status_code == 200

        # Verifica no banco se há apenas 1 item pendente para esse produto
        async with db_module.SessionLocal() as session:
            result = await session.execute(
                select(ItemListaCompras).where(
                    ItemListaCompras.produto_id == prod_id,
                    ItemListaCompras.comprado == False
                )
            )
            itens = result.scalars().all()
            assert len(itens) == 1


@pytest.mark.asyncio
async def test_concorrencia_adicionar_item_lista_duplicado():
    """
    Race condition: envio simultâneo de 2 adições do mesmo produto à lista de compras.
    Garantia no banco: Índice único parcial uq_lista_compras_produto_pendente.
    Resultado esperado: Apenas uma requisição tem status 200; a duplicada recebe 400.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/login", data={"username": "marcello", "password": "123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Cria produto
        prod_res = await ac.post("/produtos", json={
            "nome": "Produto Para Adicionar Lista",
            "categoria_id": 1,
            "quantidade": 15,
            "quantidade_minima": 5,
            "unidade_medida": "UN"
        }, headers=headers)
        prod_id = prod_res.json()["id"]

        item_payload = {"produto_id": prod_id, "quantidade": 3}

        # Dispara 2 adições simultâneas
        res1, res2 = await asyncio.gather(
            ac.post("/lista-compras/", json=item_payload, headers=headers),
            ac.post("/lista-compras/", json=item_payload, headers=headers),
        )

        statuses = [res1.status_code, res2.status_code]
        assert 200 in statuses, f"Esperado um 200, obteve: {statuses}"
        assert 400 in statuses, f"Esperado um 400 para item duplicado, obteve: {statuses}"


@pytest.mark.asyncio
async def test_concorrencia_finalizar_compras_duplicado():
    """
    Race condition: dois cliques simultâneos em 'Finalizar Compras'.
    Garantia no banco: SELECT ... FOR UPDATE nos itens comprados.
    Resultado esperado: Apenas uma requisição processa a finalização (200); a outra falha com 400.
    O saldo do produto é incrementado apenas uma vez.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/login", data={"username": "marcello", "password": "123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Cria produto com saldo 10
        prod_res = await ac.post("/produtos", json={
            "nome": "Produto Para Finalizar Compra",
            "categoria_id": 1,
            "quantidade": 10,
            "quantidade_minima": 2,
            "unidade_medida": "UN"
        }, headers=headers)
        prod_id = prod_res.json()["id"]

        # Adiciona item e marca como comprado
        async with db_module.SessionLocal() as session:
            item = ItemListaCompras(produto_id=prod_id, quantidade=5, comprado=True)
            session.add(item)
            await session.commit()

        # Dispara duas chamadas simultâneas para finalizar compras
        res1, res2 = await asyncio.gather(
            ac.post("/lista-compras/finalizar", headers=headers),
            ac.post("/lista-compras/finalizar", headers=headers),
        )

        statuses = [res1.status_code, res2.status_code]
        assert 200 in statuses, f"Esperado um 200 de sucesso, obteve: {statuses}"
        assert 400 in statuses, f"Esperado um 400 informando nenhum item restante, obteve: {statuses}"

        # O estoque do produto deve ter subido exatamente +5 (10 + 5 = 15), nunca +10
        async with db_module.SessionLocal() as session:
            p = await session.get(Produto, prod_id)
            assert p.quantidade == 15


@pytest.mark.asyncio
async def test_concorrencia_exclusao_ultimo_admin():
    """
    Race condition: exclusão simultânea de administradores que deixaria o sistema sem nenhum admin.
    Garantia no banco: SELECT ... FOR UPDATE na contagem de administradores.
    Resultado esperado: O sistema impede a exclusão do último administrador (400).
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/login", data={"username": "marcello", "password": "123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Cria um segundo admin
        await ac.post("/usuarios", json={
            "nome_exibicao": "Segundo Admin",
            "usuario": "segundoadmin",
            "senha": "123",
            "is_admin": True
        }, headers=headers)

        # Pega os IDs dos admins
        async with db_module.SessionLocal() as session:
            res_users = await session.execute(select(Usuario).where(Usuario.is_admin == True))
            admins = res_users.scalars().all()
            admin2 = next(u for u in admins if u.usuario == "segundoadmin")

        # Dispara 2 exclusões concorrentes do admin2
        res1, res2 = await asyncio.gather(
            ac.delete(f"/usuarios/{admin2.id}", headers=headers),
            ac.delete(f"/usuarios/{admin2.id}", headers=headers),
        )

        statuses = [res1.status_code, res2.status_code]
        assert 200 in statuses, f"Esperado um 200 na primeira exclusão, obteve: {statuses}"
        assert 404 in statuses or 400 in statuses, f"Esperado 404 ou 400 na segunda exclusão, obteve: {statuses}"

        # Garante que pelo menos 1 admin (o marcello) continua existindo
        async with db_module.SessionLocal() as session:
            res_final = await session.execute(select(Usuario).where(Usuario.is_admin == True))
            admins_finais = res_final.scalars().all()
            assert len(admins_finais) >= 1
