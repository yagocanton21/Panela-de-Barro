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

> **Aviso para usuários de Windows:** Os scripts na pasta `infra/` são scripts `.sh` (Shell Script para Linux). Se você tentar executá-los diretamente no PowerShell e encontrar erros como `execvpe(/bin/bash) failed`, significa que o WSL não está configurado corretamente. 
> Para resolver:
> - **Opção 1 (Mais fácil):** Abra e use o **Git Bash** para rodar os scripts, garantindo que o AWS CLI e o `jq` para Windows estejam instalados.
> - **Opção 2 (Recomendada):** Instale o Ubuntu rodando `wsl --install` no PowerShell como administrador. Entre no Ubuntu, instale as dependências (`sudo apt install awscli jq -y`) e rode os scripts de dentro do terminal do Linux.

## Configurar o AWS CLI

Se você ainda não tem o AWS CLI instalado e autenticado, siga os passos abaixo antes de rodar qualquer script.

### 1. Instalar

Veja o guia oficial para o seu sistema: <https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>

```bash
# macOS (Homebrew)
brew install awscli

# Ubuntu / WSL
sudo apt install awscli -y

# Verifique a instalação
aws --version
```

### 2. Criar uma access key

1. Acesse o **IAM** no console da AWS.
2. **Users** → selecione (ou crie) seu usuário → aba **Security credentials**.
3. Em **Access keys**, clique em **Create access key** → escolha **Command Line Interface (CLI)**.
4. Guarde o **Access key ID** e o **Secret access key** — o secret só aparece uma vez.

> O usuário precisa de permissões para EC2, RDS, S3, CloudFront, IAM e Secrets Manager (veja os Pré-requisitos).

### 3. Autenticar

```bash
aws configure
```

Preencha:

| Campo                  | Valor                    |
|------------------------|--------------------------|
| AWS Access Key ID      | sua access key           |
| AWS Secret Access Key  | seu secret               |
| Default region name    | `us-east-1`              |
| Default output format  | `json`                   |

### 4. Verificar

```bash
aws sts get-caller-identity
```

Deve retornar o `Account`, `UserId` e `Arn` da sua conta. Se aparecer erro de credencial, refaça o `aws configure`.

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
