# DER — Diagrama Entidade-Relacionamento (Conceitual / Notação Chen)

Representação **conceitual** do banco do **Panela de Barro**, na notação de
Peter Chen: **retângulo** = entidade, **elipse** = atributo, **losango** = relação.

> Diferença para o [MER lógico](mer.md): aqui não há tipo de dado nem chave
> estrangeira — é o modelo abstrato. O [mer.md](mer.md) mostra o modelo lógico
> (tabelas, tipos, PK/FK), pronto pra virar banco.

---

## Diagrama (notação Chen aproximada)

![DER conceitual - notação Chen](der.png)

<details>
<summary>Código-fonte Mermaid do diagrama</summary>

```mermaid
graph TD
    %% ===== Entidades (retangulos) =====
    USUARIO[USUARIO]
    CATEGORIA[CATEGORIA]
    PRODUTO[PRODUTO]

    %% ===== Relacionamentos (losangos) =====
    R1{classifica}
    R2{realiza}
    R3{possui}
    R4{contem}

    %% ===== Atributos de USUARIO (elipses) =====
    U1((id))
    U2((nome_exibicao))
    U3((usuario))
    U4((is_admin))
    USUARIO --- U1
    USUARIO --- U2
    USUARIO --- U3
    USUARIO --- U4

    %% ===== Atributos de CATEGORIA =====
    C1((id))
    C2((nome))
    CATEGORIA --- C1
    CATEGORIA --- C2

    %% ===== Atributos de PRODUTO =====
    P1((id))
    P2((nome))
    P3((quantidade))
    P4((quantidade_minima))
    P5((unidade_medida))
    PRODUTO --- P1
    PRODUTO --- P2
    PRODUTO --- P3
    PRODUTO --- P4
    PRODUTO --- P5

    %% ===== Ligacoes entidade -- relacao -- entidade =====
    CATEGORIA ---|1| R1
    R1 ---|N| PRODUTO

    USUARIO ---|1| R2
    R2 ---|N| MOVIMENTACAO_REL

    PRODUTO ---|1| R3
    R3 ---|N| MOVIMENTACAO_REL

    PRODUTO ---|1| R4
    R4 ---|N| LISTA_REL

    %% ===== Entidades fracas / associativas =====
    MOVIMENTACAO_REL[MOVIMENTACAO]
    M1((id))
    M2((tipo))
    M3((quantidade))
    M4((data_hora))
    M5((motivo))
    MOVIMENTACAO_REL --- M1
    MOVIMENTACAO_REL --- M2
    MOVIMENTACAO_REL --- M3
    MOVIMENTACAO_REL --- M4
    MOVIMENTACAO_REL --- M5

    LISTA_REL[LISTA_COMPRAS]
    L1((id))
    L2((nome_avulso))
    L3((quantidade))
    L4((comprado))
    L5((data_criacao))
    LISTA_REL --- L1
    LISTA_REL --- L2
    LISTA_REL --- L3
    LISTA_REL --- L4
    LISTA_REL --- L5
```

</details>

> O número nas linhas (`1` … `N`) é a **cardinalidade**: lado `1` participa uma
> vez, lado `N` participa muitas. Ex: `CATEGORIA 1 — classifica — N PRODUTO`.

---

## Entidades e atributos

| Entidade | Atributos | Identificador (PK) |
|---|---|---|
| **USUARIO** | id, nome_exibicao, usuario, senha_hash, is_admin, data_criacao | id |
| **CATEGORIA** | id, nome | id |
| **PRODUTO** | id, nome, quantidade, quantidade_minima, unidade_medida | id |
| **MOVIMENTACAO** | id, tipo, quantidade, data_hora, motivo | id |
| **LISTA_COMPRAS** | id, nome_avulso, quantidade, comprado, data_criacao | id |

> Atributo sublinhado/chave = `id` em todas. `usuario` e `nome` (categoria) são
> atributos **únicos** (candidatos a chave).

---

## Relacionamentos e cardinalidade

| Relação | Entidades | Cardinalidade | Leitura |
|---|---|---|---|
| **classifica** | CATEGORIA — PRODUTO | 1 : N | Uma categoria classifica vários produtos. |
| **realiza** | USUARIO — MOVIMENTACAO | 1 : N | Um usuário realiza várias movimentações. |
| **possui** | PRODUTO — MOVIMENTACAO | 1 : N | Um produto possui várias movimentações. |
| **contem** | PRODUTO — LISTA_COMPRAS | 1 : N | Um produto consta em vários itens da lista. |

---

## MER × DER — qual é qual aqui

- **DER conceitual (este arquivo):** ideia abstrata. Entidades, atributos,
  relações nomeadas. Sem tipo de dado, sem FK. Notação Chen.
- **MER lógico ([mer.md](mer.md)):** tradução pro banco. Tabelas com tipos,
  PK/FK, NOT NULL, regras de exclusão (CASCADE/SET NULL). Notação pé-de-galinha.

Fluxo normal de projeto: **conceitual (DER) → lógico (MER) → físico (SQL)**.

---

## Dica para apresentar / desenhar à mão

A notação Chem fica mais limpa desenhada no [draw.io](https://draw.io)
(tem formas ER prontas: retângulo, elipse, losango). Passos:

1. Desenhe um **retângulo** por entidade.
2. Pendure **elipses** (atributos) em cada uma; sublinhe a chave (`id`).
3. Ligue duas entidades por um **losango** com o nome da relação.
4. Escreva a cardinalidade (`1`, `N`) em cada ponta da linha.
