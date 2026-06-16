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

## Pré-requisitos (qualquer sistema)

- AWS CLI configurado (`aws configure`) com permissões para EC2, RDS, S3, CloudFront, IAM, Secrets Manager
- Arquivo `.env` na raiz do projeto com `ADMIN_PASSWORD` e `LICENSE_KEY` preenchidos
- `openssl` disponível no shell
- Os scripts em `infra/` são `.sh` (bash). **Windows: use WSL** — PowerShell puro e Git Bash dão dor de cabeça com PATH/`aws` não encontrado.

## Criar uma access key (igual em qualquer sistema)

1. Acesse o **IAM** no console da AWS.
2. **Users** → selecione (ou crie) seu usuário → aba **Security credentials**.
3. Em **Access keys**, clique em **Create access key** → escolha **Command Line Interface (CLI)**.
4. Guarde o **Access key ID** e o **Secret access key** — o secret só aparece uma vez.

> O usuário precisa de permissões para EC2, RDS, S3, CloudFront, IAM e Secrets Manager.

---

## 🍎 Sessão macOS

### 1. Instalar AWS CLI

```bash
brew install awscli
aws --version
```

### 2. Autenticar

```bash
aws configure
```

| Campo                  | Valor           |
|------------------------|------------------|
| AWS Access Key ID      | sua access key  |
| AWS Secret Access Key  | seu secret       |
| Default region name    | `us-east-1`      |
| Default output format  | `json`           |

Verificar:

```bash
aws sts get-caller-identity
```

### 3. Rodar o deploy

```bash
# 1. Infraestrutura (VPC + RDS + EC2) — ~8-10 min
bash infra/setup-rds.sh

# 2. Frontend (S3 + CloudFront) — use o IP exibido no passo 1
EC2_PUBLIC_IP=<seu-ip> bash infra/setup-s3-cloudfront.sh

# 3. Alarme de billing (opcional, recomendado)
ALERT_EMAIL=seu@email.com bash infra/setup-billing-alarm.sh
```

> Override de região: `AWS_DEFAULT_REGION=... bash infra/setup-rds.sh`

### 4. Acessar via SSH

```bash
ssh -i ~/.ssh/panela-prod-key.pem ubuntu@<IP_DA_EC2>
```

### 5. Se seu IP mudar (perde SSH)

```bash
bash infra/update-ssh-ip.sh
```

### 6. Limpeza (destruir tudo, irreversível)

```bash
bash infra/cleanup-aws.sh
```

---

## 🐧 Sessão WSL (Ubuntu)

> Instalar WSL primeiro (PowerShell como admin): `wsl --install`. Depois abra o Ubuntu.

### 1. Instalar dependências

```bash
sudo apt update
sudo apt install -y awscli jq
aws --version
```

### 2. Autenticar

```bash
aws configure
```

| Campo                  | Valor           |
|------------------------|------------------|
| AWS Access Key ID      | sua access key  |
| AWS Secret Access Key  | seu secret       |
| Default region name    | `us-east-1`      |
| Default output format  | `json`           |

Verificar:

```bash
aws sts get-caller-identity
```

### 3. Rodar o deploy

```bash
# 1. Infraestrutura (VPC + RDS + EC2) — ~8-10 min
bash infra/setup-rds.sh

# 2. Frontend (S3 + CloudFront) — use o IP exibido no passo 1
EC2_PUBLIC_IP=<seu-ip> bash infra/setup-s3-cloudfront.sh

# 3. Alarme de billing (opcional, recomendado)
ALERT_EMAIL=seu@email.com bash infra/setup-billing-alarm.sh
```

> Override de região: `AWS_DEFAULT_REGION=... bash infra/setup-rds.sh`

### 4. Acessar via SSH

```bash
ssh -i ~/.ssh/panela-prod-key.pem ubuntu@<IP_DA_EC2>
```

> Repo clonado no Windows e aberto via WSL? Cuidado com `.env` salvo em CRLF (Notepad) — quebra o `source` do bash. Edite com VSCode ou rode `dos2unix .env` antes.

### 5. Se seu IP mudar (perde SSH)

```bash
bash infra/update-ssh-ip.sh
```

### 6. Limpeza (destruir tudo, irreversível)

```bash
bash infra/cleanup-aws.sh
```

---

## 🪟 Windows

**Use a [sessão WSL](#-sessão-wsl-ubuntu) acima.** PowerShell puro não interpreta `.sh`, e Git Bash costuma dar `aws: command not found` por problema de PATH entre os dois ambientes. WSL evita essa dor de cabeça — é um Linux de verdade.

Se nunca instalou: abra PowerShell como admin e rode `wsl --install`, reinicie, abra "Ubuntu" no menu Iniciar e siga a sessão WSL.

---

## Variáveis opcionais do `setup-rds.sh`

| Variável        | Padrão               | Descrição                              |
|-----------------|----------------------|------------------------------------------|
| `DB_PASSWORD`   | gerada automaticamente | Senha do RDS                          |
| `EC2_TYPE`      | `t3.micro`           | Tipo da instância EC2                  |
| `ADMIN_IP`      | IP público detectado | IP liberado para SSH                   |
| `GOLDEN_AMI_ID` | Ubuntu 22.04 stock   | AMI pré-configurada (Golden Image)     |
| `REPO_URL`      | repo público         | URL do repositório clonado pela EC2    |

## Consultar o IP da EC2 novamente

```bash
aws ec2 describe-instances \
  --filters "Name=tag:App,Values=panela-de-barro" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text
```

## Checklist de deploy

- [ ] `.env` com `ADMIN_PASSWORD` e `LICENSE_KEY` válidos
- [ ] AWS CLI configurado e autenticado
- [ ] `bash infra/setup-rds.sh` — aguardar EC2 subir (~5 min)
- [ ] Testar `http://<IP_EC2>` no browser
- [ ] `bash infra/setup-s3-cloudfront.sh` — frontend no CDN
- [ ] `bash infra/setup-billing-alarm.sh` — alarme de custo
- [ ] Guardar o arquivo `~/.ssh/panela-prod-key.pem` em local seguro
