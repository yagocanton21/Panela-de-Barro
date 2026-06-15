<p align="center">
  <h1 align="center">🍲 Panela de Barro</h1>
  <p align="center">
    <strong>Sistema de Gestão de Estoque</strong><br/>
    Controle inteligente de produtos, movimentações e lista de compras.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS" />
</p>

---

## 📋 Sobre o Projeto

**Panela de Barro** é uma aplicação web fullstack para gestão de estoque, movimentações, lista de compras e controle de usuários. Projetada para ambientes de cozinha e restaurantes.

| Camada     | Tecnologia                            |
| ---------- | ------------------------------------- |
| Frontend   | React 18 + Vite                       |
| Backend    | FastAPI · Python 3.11 · async         |
| Banco      | PostgreSQL 15 (AWS RDS)               |
| ORM        | SQLAlchemy 2 (asyncpg) + Alembic      |
| Auth       | JWT + OAuth2 (bcrypt)                 |
| Proxy      | Nginx                                 |
| Container  | Docker + Docker Compose               |
| Rede       | VPC custom · subnets pública/privadas |
| CDN        | S3 + CloudFront (HTTPS)               |
| Infra      | EC2 + RDS + Secrets Manager (AWS)     |

---

## ✨ Funcionalidades

| Módulo              | Descrição                                                                        |
| ------------------- | -------------------------------------------------------------------------------- |
| 🔐 Autenticação     | Login JWT, hash bcrypt, rotas protegidas por role                                |
| 📦 Produtos         | CRUD completo, listagem de itens em falta (abaixo do mínimo)                     |
| 🏷️ Categorias       | CRUD com categorias pré-cadastradas                                              |
| 🔄 Movimentações    | Entradas e saídas com ajuste automático do estoque                               |
| 🛒 Lista de Compras | Sincroniza com produtos em falta, finalização gera entrada automática            |
| 👥 Usuários         | CRUD restrito a admins, edição com senha opcional, proteção contra auto-exclusão |
| 📊 Dashboard        | Visão geral do estoque com indicadores                                           |
| 📜 Histórico        | Registro de todas as movimentações realizadas                                    |

---

## 📚 Documentação

| Doc | Descrição |
| --- | --------- |
| [Rodar localmente](docs/rodar-localmente.md) | Docker Compose, `.env`, acesso, dev sem Docker |
| [Arquitetura](docs/arquitetura.md) | Diagrama de serviços, roteamento, módulos, auth |
| [Deploy AWS](docs/deploy-aws.md) | VPC + EC2 + RDS + S3 + CloudFront, passo a passo |
| [Testes](docs/testes.md) | pytest, estrutura, SQLite local vs PostgreSQL CI |

---

## 📡 API

Documentação interativa (Swagger): **http://localhost/docs** (local) ou **http://\<IP-EC2\>/api/docs** (produção).

---

## 🔒 Segurança

- ✅ Senhas armazenadas com **hash bcrypt** (nunca em texto puro)
- ✅ Tokens **JWT assinados**, expiração de 24h
- ✅ Rotas administrativas protegidas — apenas admins
- ✅ **VPC custom** com subnets privadas isolando o RDS (sem rota para internet)
- ✅ RDS **sem acesso público** — porta 5432 liberada apenas para o SG da EC2
- ✅ **SSH restrito ao IP do administrador** (porta 22 nunca aberta a `0.0.0.0/0`)
- ✅ Frontend em **S3 privado** (OAC) servido só via CloudFront, **HTTPS obrigatório**
- ✅ Credenciais no **AWS Secrets Manager** — nunca em texto claro no disco
- ✅ IAM com **permissão mínima** — EC2 acessa apenas o secret específico do projeto
- ✅ `.env` no `.gitignore` — credenciais nunca versionadas
- ✅ Proteção contra **auto-exclusão** e exclusão do último admin

---

## 📄 Licença

Este projeto é de uso privado.

---

<p align="center">
  Feito com ☕ e 🍲 por<br/>
  <a href="https://github.com/yagocanton21">Yago Canton</a> · Marcello Esteves · Gustavo Fernandes
</p>
