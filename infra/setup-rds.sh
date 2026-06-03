#!/bin/bash
# Deploy completo: VPC + Subnets + RDS + Security Groups + Secrets Manager + IAM + Key Pair + EC2
#
# Uso:
#   ADMIN_PASSWORD=minhasenha LICENSE_KEY=abc123 bash infra/setup-rds.sh
#
# Variáveis opcionais:
#   DB_PASSWORD    — senha do banco (gera automaticamente se omitida)
#   EC2_TYPE       — tipo da instância (padrão: t3.small)
#   ADMIN_IP       — IP liberado para SSH (auto-detecta o IP público atual se omitido)
#   GOLDEN_AMI_ID  — AMI pré-configurada (Golden Image). Se omitida, usa Ubuntu 22.04 stock

set -e

export AWS_PAGER=""

# ---------- Validação ----------
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
LICENSE_KEY="${LICENSE_KEY:-}"

if [ -z "$ADMIN_PASSWORD" ] || [ -z "$LICENSE_KEY" ]; then
  echo "ERRO: ADMIN_PASSWORD e LICENSE_KEY são obrigatórios."
  echo ""
  echo "Uso: ADMIN_PASSWORD=minhasenha LICENSE_KEY=abc123 bash infra/setup-rds.sh"
  exit 1
fi

REGION="us-east-1"
APP="panela-de-barro"
DB_INSTANCE_ID="${APP}-db"
DB_NAME="estoque_db"
DB_USER="panela_admin"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -hex 16)}"
DB_CLASS="db.t3.micro"
# Free Tier limita retencao de backup (use 1; conta paga aceita ate 35)
BACKUP_RETENTION="${BACKUP_RETENTION:-1}"
EC2_TYPE="${EC2_TYPE:-t3.small}"
KEY_NAME="panela-prod-key"
KEY_FILE="$HOME/.ssh/${KEY_NAME}.pem"

# VPC / Subnets (CIDRs exigidos pela arquitetura)
VPC_CIDR="10.0.0.0/16"
PUBLIC_SUBNET_CIDR="10.0.1.0/24"
PRIVATE_SUBNET_A_CIDR="10.0.2.0/24"
PRIVATE_SUBNET_B_CIDR="10.0.3.0/24"
AZ_A="${REGION}a"
AZ_B="${REGION}b"

# SSH restrito ao IP do administrador (menor privilégio)
if [ -z "${ADMIN_IP:-}" ]; then
  ADMIN_IP="$(curl -s https://checkip.amazonaws.com || true)"
fi
if [ -z "$ADMIN_IP" ]; then
  echo "ERRO: não foi possível detectar ADMIN_IP. Informe manualmente: ADMIN_IP=1.2.3.4 ..."
  exit 1
fi
ADMIN_CIDR="${ADMIN_IP}/32"

echo ""
echo "============================================="
echo "  Deploy Panela de Barro — AWS"
echo "============================================="
echo "  SSH liberado apenas para: $ADMIN_CIDR"
echo ""

tag_spec() { echo "ResourceType=$1,Tags=[{Key=App,Value=${APP}},{Key=Name,Value=$2}]"; }

# ---------- [1/11] VPC ----------
echo "==> [1/11] Criando/localizando VPC ($VPC_CIDR)..."
VPC_ID=$(aws ec2 describe-vpcs --region "$REGION" \
  --filters "Name=tag:App,Values=${APP}" "Name=cidr,Values=$VPC_CIDR" \
  --query "Vpcs[0].VpcId" --output text 2>/dev/null || echo "None")

if [ "$VPC_ID" = "None" ] || [ -z "$VPC_ID" ]; then
  VPC_ID=$(aws ec2 create-vpc --region "$REGION" \
    --cidr-block "$VPC_CIDR" \
    --tag-specifications "$(tag_spec vpc ${APP}-vpc)" \
    --query "Vpc.VpcId" --output text)
  aws ec2 modify-vpc-attribute --region "$REGION" --vpc-id "$VPC_ID" --enable-dns-hostnames
  aws ec2 modify-vpc-attribute --region "$REGION" --vpc-id "$VPC_ID" --enable-dns-support
fi
echo "    VPC: $VPC_ID"

# ---------- [2/11] Subnets + IGW + Rotas ----------
echo "==> [2/11] Criando subnets pública/privadas, IGW e rotas..."

create_subnet() {
  local cidr="$1" az="$2" name="$3"
  local sid
  sid=$(aws ec2 describe-subnets --region "$REGION" \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=cidr-block,Values=$cidr" \
    --query "Subnets[0].SubnetId" --output text 2>/dev/null || echo "None")
  if [ "$sid" = "None" ] || [ -z "$sid" ]; then
    sid=$(aws ec2 create-subnet --region "$REGION" \
      --vpc-id "$VPC_ID" --cidr-block "$cidr" --availability-zone "$az" \
      --tag-specifications "$(tag_spec subnet $name)" \
      --query "Subnet.SubnetId" --output text)
  fi
  echo "$sid"
}

PUBLIC_SUBNET_ID=$(create_subnet "$PUBLIC_SUBNET_CIDR" "$AZ_A" "${APP}-public-a")
PRIVATE_SUBNET_A_ID=$(create_subnet "$PRIVATE_SUBNET_A_CIDR" "$AZ_A" "${APP}-private-a")
PRIVATE_SUBNET_B_ID=$(create_subnet "$PRIVATE_SUBNET_B_CIDR" "$AZ_B" "${APP}-private-b")

# IP público automático na subnet pública (EC2 acessa internet via IGW; sem NAT)
aws ec2 modify-subnet-attribute --region "$REGION" \
  --subnet-id "$PUBLIC_SUBNET_ID" --map-public-ip-on-launch

# Internet Gateway
IGW_ID=$(aws ec2 describe-internet-gateways --region "$REGION" \
  --filters "Name=attachment.vpc-id,Values=$VPC_ID" \
  --query "InternetGateways[0].InternetGatewayId" --output text 2>/dev/null || echo "None")
if [ "$IGW_ID" = "None" ] || [ -z "$IGW_ID" ]; then
  IGW_ID=$(aws ec2 create-internet-gateway --region "$REGION" \
    --tag-specifications "$(tag_spec internet-gateway ${APP}-igw)" \
    --query "InternetGateway.InternetGatewayId" --output text)
  aws ec2 attach-internet-gateway --region "$REGION" \
    --internet-gateway-id "$IGW_ID" --vpc-id "$VPC_ID"
fi

# Route table pública → IGW
RTB_ID=$(aws ec2 describe-route-tables --region "$REGION" \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=${APP}-public-rt" \
  --query "RouteTables[0].RouteTableId" --output text 2>/dev/null || echo "None")
if [ "$RTB_ID" = "None" ] || [ -z "$RTB_ID" ]; then
  RTB_ID=$(aws ec2 create-route-table --region "$REGION" --vpc-id "$VPC_ID" \
    --tag-specifications "$(tag_spec route-table ${APP}-public-rt)" \
    --query "RouteTable.RouteTableId" --output text)
fi
aws ec2 create-route --region "$REGION" --route-table-id "$RTB_ID" \
  --destination-cidr-block 0.0.0.0/0 --gateway-id "$IGW_ID" 2>/dev/null || true
aws ec2 associate-route-table --region "$REGION" \
  --route-table-id "$RTB_ID" --subnet-id "$PUBLIC_SUBNET_ID" 2>/dev/null || true

# Subnets privadas ficam sem rota para internet (RDS não precisa de saída → sem NAT, sem custo)
echo "    Public: $PUBLIC_SUBNET_ID | Private: $PRIVATE_SUBNET_A_ID, $PRIVATE_SUBNET_B_ID"

# ---------- [3/11] Security Groups ----------
echo "==> [3/11] Criando Security Groups..."

EC2_SG_ID=$(aws ec2 create-security-group --region "$REGION" \
  --group-name "${APP}-ec2-sg" \
  --description "${APP} EC2 instances" \
  --vpc-id "$VPC_ID" \
  --query "GroupId" --output text 2>/dev/null || \
  aws ec2 describe-security-groups --region "$REGION" \
    --filters "Name=group-name,Values=${APP}-ec2-sg" "Name=vpc-id,Values=$VPC_ID" \
    --query "SecurityGroups[0].GroupId" --output text)

# Web: 80/443 público; SSH apenas do IP do admin (menor privilégio)
aws ec2 authorize-security-group-ingress --region "$REGION" \
  --group-id "$EC2_SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0 2>/dev/null || true
aws ec2 authorize-security-group-ingress --region "$REGION" \
  --group-id "$EC2_SG_ID" --protocol tcp --port 443 --cidr 0.0.0.0/0 2>/dev/null || true
aws ec2 authorize-security-group-ingress --region "$REGION" \
  --group-id "$EC2_SG_ID" --protocol tcp --port 22 --cidr "$ADMIN_CIDR" 2>/dev/null || true

RDS_SG_ID=$(aws ec2 create-security-group --region "$REGION" \
  --group-name "${APP}-rds-sg" \
  --description "${APP} RDS acesso apenas da EC2" \
  --vpc-id "$VPC_ID" \
  --query "GroupId" --output text 2>/dev/null || \
  aws ec2 describe-security-groups --region "$REGION" \
    --filters "Name=group-name,Values=${APP}-rds-sg" "Name=vpc-id,Values=$VPC_ID" \
    --query "SecurityGroups[0].GroupId" --output text)

aws ec2 authorize-security-group-ingress --region "$REGION" \
  --group-id "$RDS_SG_ID" --protocol tcp --port 5432 \
  --source-group "$EC2_SG_ID" 2>/dev/null || true

if [ "$RDS_SG_ID" = "None" ] || [ -z "$RDS_SG_ID" ]; then
  echo "ERRO: Falha ao criar ou encontrar o Security Group do RDS."
  exit 1
fi

echo "    EC2 SG: $EC2_SG_ID | RDS SG: $RDS_SG_ID"

# ---------- [4/11] DB Subnet Group (subnets privadas, 2 AZs) ----------
echo "==> [4/11] Criando DB Subnet Group (subnets privadas)..."
aws rds create-db-subnet-group --region "$REGION" \
  --db-subnet-group-name "${APP}-subnet-group" \
  --db-subnet-group-description "${APP} DB subnet group (privadas)" \
  --subnet-ids "$PRIVATE_SUBNET_A_ID" "$PRIVATE_SUBNET_B_ID" \
  --tags Key=App,Value="${APP}" 2>/dev/null || echo "    Subnet group já existe, continuando..."

# ---------- [5/11] RDS ----------
echo "==> [5/11] Criando RDS PostgreSQL 15 ($DB_CLASS)..."

DB_STATUS=$(aws rds describe-db-instances --region "$REGION" \
  --db-instance-identifier "$DB_INSTANCE_ID" \
  --query "DBInstances[0].DBInstanceStatus" --output text 2>/dev/null || echo "not-found")

create_rds() {
  aws rds create-db-instance --region "$REGION" \
    --db-instance-identifier "$DB_INSTANCE_ID" \
    --db-instance-class "$DB_CLASS" \
    --engine postgres \
    --engine-version "15" \
    --allocated-storage 20 \
    --max-allocated-storage 100 \
    --db-name "$DB_NAME" \
    --master-username "$DB_USER" \
    --master-user-password "$DB_PASSWORD" \
    --vpc-security-group-ids "$RDS_SG_ID" \
    --db-subnet-group-name "${APP}-subnet-group" \
    --no-publicly-accessible \
    --storage-encrypted \
    --backup-retention-period "$BACKUP_RETENTION" \
    --preferred-backup-window "03:00-04:00" \
    --preferred-maintenance-window "Mon:04:00-Mon:05:00" \
    --copy-tags-to-snapshot \
    --no-deletion-protection \
    --tags Key=App,Value="${APP}"
}

if [ "$DB_STATUS" = "not-found" ] || [ "$DB_STATUS" = "None" ]; then
  echo "    Criando nova instância RDS (backups: ${BACKUP_RETENTION} dia(s), janela 03:00-04:00 UTC)..."
  create_rds
elif [ "$DB_STATUS" = "deleting" ]; then
  echo "    Instância sendo deletada. Aguardando conclusão (~5 min)..."
  aws rds wait db-instance-deleted --region "$REGION" \
    --db-instance-identifier "$DB_INSTANCE_ID" 2>/dev/null || true
  echo "    Criando nova instância RDS..."
  create_rds
else
  echo "    Instância já existe (status: $DB_STATUS), continuando..."
fi

echo "    Aguardando RDS ficar disponível (~5-10 min)..."
aws rds wait db-instance-available --region "$REGION" \
  --db-instance-identifier "$DB_INSTANCE_ID"

RDS_ENDPOINT=$(aws rds describe-db-instances --region "$REGION" \
  --db-instance-identifier "$DB_INSTANCE_ID" \
  --query "DBInstances[0].Endpoint.Address" --output text)

echo "    RDS pronto: $RDS_ENDPOINT"

# ---------- [6/11] Secrets Manager ----------
echo "==> [6/11] Salvando credenciais no Secrets Manager..."
SECRET_VALUE=$(cat <<JSON
{
  "username": "${DB_USER}",
  "password": "${DB_PASSWORD}",
  "host": "${RDS_ENDPOINT}",
  "dbname": "${DB_NAME}",
  "port": "5432"
}
JSON
)

SECRET_ARN=$(aws secretsmanager create-secret --region "$REGION" \
  --name "${APP}/db-credentials" \
  --description "Credenciais RDS do ${APP}" \
  --secret-string "$SECRET_VALUE" \
  --query "ARN" --output text 2>/dev/null || \
  aws secretsmanager put-secret-value --region "$REGION" \
    --secret-id "${APP}/db-credentials" \
    --secret-string "$SECRET_VALUE" \
    --query "ARN" --output text)

echo "    Secret ARN: $SECRET_ARN"

# ---------- [7/11] IAM ----------
echo "==> [7/11] Criando IAM Role para EC2..."
cat > /tmp/ec2-trust-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ec2.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

cat > /tmp/ec2-secrets-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "secretsmanager:GetSecretValue",
    "Resource": "${SECRET_ARN}"
  }]
}
EOF

aws iam create-role \
  --role-name "${APP}-ec2-role" \
  --assume-role-policy-document file:///tmp/ec2-trust-policy.json \
  --tags Key=App,Value="${APP}" 2>/dev/null || \
  echo "    Role já existe, continuando..."

aws iam put-role-policy \
  --role-name "${APP}-ec2-role" \
  --policy-name "${APP}-secrets-access" \
  --policy-document file:///tmp/ec2-secrets-policy.json

aws iam create-instance-profile \
  --instance-profile-name "${APP}-ec2-profile" 2>/dev/null || \
  echo "    Instance profile já existe, continuando..."

aws iam add-role-to-instance-profile \
  --instance-profile-name "${APP}-ec2-profile" \
  --role-name "${APP}-ec2-role" 2>/dev/null || true

echo "    IAM role e instance profile prontos."

# ---------- [8/11] Key Pair ----------
echo "==> [8/11] Criando Key Pair..."
KEY_EXISTS=$(aws ec2 describe-key-pairs --region "$REGION" \
  --filters "Name=key-name,Values=$KEY_NAME" \
  --query "KeyPairs[0].KeyName" --output text 2>/dev/null || echo "")

if [ -z "$KEY_EXISTS" ] || [ "$KEY_EXISTS" = "None" ]; then
  aws ec2 create-key-pair --region "$REGION" \
    --key-name "$KEY_NAME" \
    --query "KeyMaterial" --output text > "$KEY_FILE"
  chmod 400 "$KEY_FILE"
  echo "    Key salva em: $KEY_FILE"
else
  echo "    Key pair já existe: $KEY_NAME"
fi

# ---------- [9/11] AMI (Golden Image) ----------
echo "==> [9/11] Selecionando AMI..."
if [ -n "${GOLDEN_AMI_ID:-}" ]; then
  AMI_ID="$GOLDEN_AMI_ID"
  echo "    Golden Image informada: $AMI_ID (boot acelerado, sem bootstrap)"
else
  AMI_ID=$(aws ssm get-parameters --region "$REGION" \
    --names /aws/service/canonical/ubuntu/server/22.04/stable/current/amd64/hvm/ebs-gp2/ami-id \
    --query "Parameters[0].Value" --output text)
  echo "    AMI stock Ubuntu 22.04: $AMI_ID"
  echo "    (gere uma Golden Image depois com: bash infra/create-ami.sh)"
fi

# ---------- [10/11] EC2 ----------
echo "==> [10/11] Lançando EC2 ($EC2_TYPE) na subnet pública..."

USER_DATA=$(cat <<USERDATA
#!/bin/bash
set -e

APP="panela-de-barro"
REGION="us-east-1"

apt-get update -y
apt-get install -y ca-certificates curl gnupg git unzip python3

curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/awscliv2.zip /tmp/aws

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \$(. /etc/os-release && echo "\$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

echo "==> Buscando credenciais do Secrets Manager..."
SECRET_JSON=\$(aws secretsmanager get-secret-value --region "\$REGION" \
  --secret-id "\${APP}/db-credentials" \
  --query "SecretString" --output text)

DB_HOST=\$(echo "\$SECRET_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['host'])")
DB_PASSWORD=\$(echo "\$SECRET_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['password'])")
DB_USER=\$(echo "\$SECRET_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['username'])")
DB_NAME=\$(echo "\$SECRET_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['dbname'])")

APP_DIR="/home/ubuntu/app"
git clone "https://github.com/yagocanton21/Panela-de-Barro.git" "\$APP_DIR"
chown -R ubuntu:ubuntu "\$APP_DIR"

SECRET_KEY=\$(openssl rand -hex 32)

cat > "\$APP_DIR/.env" <<ENV
POSTGRES_USER=\${DB_USER}
POSTGRES_PASSWORD=\${DB_PASSWORD}
POSTGRES_DB=\${DB_NAME}
POSTGRES_HOST=\${DB_HOST}
POSTGRES_PORT=5432
SECRET_KEY=\${SECRET_KEY}
ADMIN_USERNAME=admin
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ADMIN_DISPLAY_NAME=Admin
LICENSE_KEY=${LICENSE_KEY}
ENV

cd "\$APP_DIR"
docker compose -f docker-compose.prod.yml up -d --build
USERDATA
)

echo "    Aguardando IAM profile propagar (15s)..."
sleep 15

INSTANCE_ID=$(aws ec2 run-instances --region "$REGION" \
  --image-id "$AMI_ID" \
  --instance-type "$EC2_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$EC2_SG_ID" \
  --subnet-id "$PUBLIC_SUBNET_ID" \
  --iam-instance-profile Name="${APP}-ec2-profile" \
  --user-data "$USER_DATA" \
  --tag-specifications \
    "ResourceType=instance,Tags=[{Key=Name,Value=${APP}-prod},{Key=App,Value=${APP}}]" \
  --query "Instances[0].InstanceId" --output text)

echo "    EC2 lançada: $INSTANCE_ID"
echo "    Aguardando instância ficar running..."
aws ec2 wait instance-running --region "$REGION" --instance-ids "$INSTANCE_ID"

PUBLIC_IP=$(aws ec2 describe-instances --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].PublicIpAddress" --output text)

# ---------- [11/11] Resumo ----------
echo ""
echo "============================================="
echo "  DEPLOY CONCLUÍDO"
echo "============================================="
echo "  VPC         : $VPC_ID ($VPC_CIDR)"
echo "  Subnet pub  : $PUBLIC_SUBNET_ID ($PUBLIC_SUBNET_CIDR)"
echo "  Subnet priv : $PRIVATE_SUBNET_A_ID, $PRIVATE_SUBNET_B_ID"
echo "  EC2 ID      : $INSTANCE_ID"
echo "  IP Público  : $PUBLIC_IP"
echo "  RDS         : $RDS_ENDPOINT (backups ${BACKUP_RETENTION} dia(s))"
echo "  SSH liberado: $ADMIN_CIDR"
echo ""
echo "  App estará disponível em ~8-10 min:"
echo "  http://${PUBLIC_IP}"
echo ""
echo "  SSH:"
echo "  ssh -i $KEY_FILE ubuntu@${PUBLIC_IP}"
echo ""
echo "  Frontend via S3 + CloudFront (HTTPS):"
echo "  EC2_PUBLIC_IP=${PUBLIC_IP} bash infra/setup-s3-cloudfront.sh"
echo ""
echo "  Golden Image (acelerar próximos deploys):"
echo "  INSTANCE_ID=${INSTANCE_ID} bash infra/create-ami.sh"
echo ""
echo "  Limpeza após uso:"
echo "  bash infra/cleanup-aws.sh"
echo "============================================="
