# Deploy AWS

## Visão geral da infraestrutura

```
Internet
    │
    ├── CloudFront → S3 (frontend React buildado)
    │
    └── EC2 (público, porta 80)
            │  nginx + backend FastAPI
            │
        VPC privada
            │
           RDS PostgreSQL (subnet privada, sem acesso direto)
```

## Pré-requisitos

- AWS CLI configurado (`aws configure`) com permissões para EC2, RDS, S3, CloudFront, IAM, Secrets Manager
- Arquivo `.env` na raiz com `ADMIN_PASSWORD` e `LICENSE_KEY` preenchidos
- `openssl` disponível no shell

## Ordem de execução

Execute os scripts nessa ordem:

### 1. Infraestrutura principal (VPC + RDS + EC2)

```bash
bash infra/setup-rds.sh
```

O que faz (11 etapas):
1. VPC `10.0.0.0/16`
2. Subnets: pública `10.0.1.0/24`, privadas `10.0.2.0/24` e `10.0.3.0/24`
3. Internet Gateway + tabela de rotas
4. Security Groups (SSH restrito ao seu IP, HTTP/HTTPS aberto, RDS só via EC2)
5. RDS PostgreSQL `db.t3.micro` na subnet privada
6. Secrets Manager com credenciais do banco
7. Key Pair SSH (`~/.ssh/panela-prod-key.pem`)
8. IAM Role + Instance Profile para a EC2 acessar Secrets Manager
9. EC2 `t3.micro` na subnet pública
10. User data: clona o repo, sobe Docker Compose em modo produção
11. Exibe IP público da EC2

> Região padrão: `us-east-1`. Override: `AWS_DEFAULT_REGION=...`

**Variáveis opcionais:**

| Variável        | Padrão               | Descrição                              |
|-----------------|----------------------|----------------------------------------|
| `DB_PASSWORD`   | gerada automaticamente | Senha do RDS                          |
| `EC2_TYPE`      | `t3.micro`           | Tipo da instância EC2                  |
| `ADMIN_IP`      | IP público detectado | IP liberado para SSH                   |
| `GOLDEN_AMI_ID` | Ubuntu 22.04 stock   | AMI pré-configurada (Golden Image)     |
| `REPO_URL`      | repo público         | URL do repositório clonado pela EC2    |

### 2. Frontend (S3 + CloudFront)

```bash
bash infra/setup-s3-cloudfront.sh
```

O que faz:
- Cria bucket S3 privado
- Faz build do React (`npm run build`)
- Faz upload do `dist/` para o S3
- Cria distribuição CloudFront apontando para o bucket
- Exibe a URL do CloudFront ao final

### 3. Alarme de billing (opcional mas recomendado)

```bash
ALERT_EMAIL=seu@email.com bash infra/setup-billing-alarm.sh
```

Cria alarme CloudWatch que envia e-mail se o custo estimado mensal ultrapassar US$5. Após rodar, **confirme a inscrição clicando no link que a AWS envia para o e-mail informado** — sem isso o alarme não dispara.

> Limite customizável: `THRESHOLD=10 ALERT_EMAIL=seu@email.com bash infra/setup-billing-alarm.sh`

## Atualizar IP para SSH

Se seu IP mudou e perdeu acesso SSH à EC2:

```bash
bash infra/update-ssh-ip.sh
```

Detecta seu IP atual e atualiza o Security Group automaticamente.

## Acessar a EC2 via SSH

```bash
ssh -i ~/.ssh/panela-prod-key.pem ubuntu@<IP_DA_EC2>
```

O IP é exibido ao final do `setup-rds.sh`. Para consultar novamente:

```bash
aws ec2 describe-instances \
  --filters "Name=tag:App,Values=panela-de-barro" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text
```

## Limpeza (destruir tudo)

```bash
bash infra/cleanup-aws.sh
```

Remove todos os recursos criados pelos scripts (EC2, RDS, VPC, S3, CloudFront, Secrets Manager, IAM). **Irreversível — apaga dados do banco.**

## Checklist de deploy

- [ ] `.env` com `ADMIN_PASSWORD` e `LICENSE_KEY` válidos
- [ ] AWS CLI configurado e autenticado
- [ ] `bash infra/setup-rds.sh` — aguardar EC2 subir (~5 min)
- [ ] Testar `http://<IP_EC2>` no browser
- [ ] `bash infra/setup-s3-cloudfront.sh` — frontend no CDN
- [ ] `bash infra/setup-billing-alarm.sh` — alarme de custo
- [ ] Guardar o arquivo `~/.ssh/panela-prod-key.pem` em local seguro
