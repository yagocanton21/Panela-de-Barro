import pytest
from httpx import AsyncClient, ASGITransport
from api.main import app
from api.models.usuario import Usuario, hash_password
from api.models.movimentacao import Movimentacao
from api.models.produto import Produto
from api.auth import criar_token_acesso
from sqlalchemy import select
import api.database as db_module

@pytest.mark.asyncio
async def test_usuario_comum_bloqueado_em_rotas_admin():
    """
    Testa se um usuário comum (is_admin=False) recebe 403 Forbidden
    ao tentar executar mutações em produtos, categorias e usuários.
    """
    # 1. Cria usuário comum no banco
    async with db_module.SessionLocal() as session:
        comum = Usuario(
            nome_exibicao="Operador Padrao",
            usuario="operador_seguranca",
            senha_hash=hash_password("123"),
            is_admin=False
        )
        session.add(comum)
        await session.commit()
        await session.refresh(comum)
        comum_id = comum.id

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Login como usuário comum
        login_res = await ac.post("/login", data={"username": "operador_seguranca", "password": "123"})
        assert login_res.status_code == 200
        token_comum = login_res.json()["access_token"]
        headers_comum = {"Authorization": f"Bearer {token_comum}"}

        # Login como admin (marcello)
        login_admin = await ac.post("/login", data={"username": "marcello", "password": "123"})
        token_admin = login_admin.json()["access_token"]
        headers_admin = {"Authorization": f"Bearer {token_admin}"}

        # 1. Tentativa de criar produto por usuário comum -> 403
        res = await ac.post("/produtos", json={
            "nome": "Produto Proibido Comum",
            "categoria_id": 1,
            "quantidade": 10,
            "quantidade_minima": 2,
            "unidade_medida": "UN"
        }, headers=headers_comum)
        assert res.status_code == 403, f"Esperado 403 ao criar produto, obteve: {res.status_code}"

        # Admin cria produto para testes seguintes
        res_admin_prod = await ac.post("/produtos", json={
            "nome": "Produto Teste Permissao",
            "categoria_id": 1,
            "quantidade": 10,
            "quantidade_minima": 2,
            "unidade_medida": "UN"
        }, headers=headers_admin)
        assert res_admin_prod.status_code == 201
        prod_id = res_admin_prod.json()["id"]

        # 2. Tentativa de editar produto por usuário comum -> 403
        res_edit = await ac.put(f"/produtos/{prod_id}", json={
            "nome": "Tentativa Hacker",
            "categoria_id": 1,
            "quantidade": 999,
            "quantidade_minima": 0,
            "unidade_medida": "UN"
        }, headers=headers_comum)
        assert res_edit.status_code == 403

        # 3. Tentativa de deletar produto por usuário comum -> 403
        res_del = await ac.delete(f"/produtos/{prod_id}", headers=headers_comum)
        assert res_del.status_code == 403

        # 4. Tentativa de criar categoria por usuário comum -> 403
        res_cat = await ac.post("/categorias", json={"nome": "Categoria Proibida"}, headers=headers_comum)
        assert res_cat.status_code == 403

        # 5. Tentativa de listar usuários por usuário comum -> 403
        res_users = await ac.get("/usuarios", headers=headers_comum)
        assert res_users.status_code == 403


@pytest.mark.asyncio
async def test_ajuste_quantidade_produto_gera_auditoria_em_movimentacao():
    """
    Testa se ao editar a quantidade de um produto via PUT /produtos/{id},
    uma movimentação auditada é gerada automaticamente no banco.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/login", data={"username": "marcello", "password": "123"})
        token_admin = login_res.json()["access_token"]
        headers_admin = {"Authorization": f"Bearer {token_admin}"}

        # Cria produto com saldo 20
        res = await ac.post("/produtos", json={
            "nome": "Produto Auditoria Estoque",
            "categoria_id": 1,
            "quantidade": 20,
            "quantidade_minima": 5,
            "unidade_medida": "KG"
        }, headers=headers_admin)
        assert res.status_code == 201
        prod_id = res.json()["id"]

        # Ajusta para 25 (+5 de entrada)
        res_edit = await ac.put(f"/produtos/{prod_id}", json={
            "nome": "Produto Auditoria Estoque",
            "categoria_id": 1,
            "quantidade": 25,
            "quantidade_minima": 5,
            "unidade_medida": "KG"
        }, headers=headers_admin)
        assert res_edit.status_code == 200

        # Verifica se gerou movimentação auditada no banco
        async with db_module.SessionLocal() as session:
            result = await session.execute(
                select(Movimentacao).where(
                    Movimentacao.produto_id == prod_id,
                    Movimentacao.motivo == "Ajuste manual de estoque via edição de produto"
                )
            )
            mov = result.scalars().first()
            assert mov is not None
            assert mov.tipo == "entrada"
            assert mov.quantidade == 5


@pytest.mark.asyncio
async def test_revogacao_imediata_ao_excluir_usuario():
    """
    Testa se a exclusão de um usuário invalida imediatamente o seu token JWT
    graças à verificação ativa no banco em obter_usuario_atual.
    """
    # 1. Cria usuário temporário
    async with db_module.SessionLocal() as session:
        temp_user = Usuario(
            nome_exibicao="Temporario",
            usuario="temp_revogacao",
            senha_hash=hash_password("123"),
            is_admin=False
        )
        session.add(temp_user)
        await session.commit()
        await session.refresh(temp_user)
        temp_id = temp_user.id

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/login", data={"username": "temp_revogacao", "password": "123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Token é válido antes da exclusão
        res_ok = await ac.get("/produtos", headers=headers)
        assert res_ok.status_code == 200

        # Exclui o usuário no banco
        async with db_module.SessionLocal() as session:
            u = await session.get(Usuario, temp_id)
            await session.delete(u)
            await session.commit()

        # O mesmo token agora DEVE ser rejeitado com 401 Unauthorized
        res_invalido = await ac.get("/produtos", headers=headers)
        assert res_invalido.status_code == 401
