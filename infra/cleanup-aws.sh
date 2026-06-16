#!/bin/bash
# Limpeza dos recursos AWS do projeto Panela de Barro
# Uso: ./infra/cleanup-aws.sh [--dry-run]
#
# Remove (em ordem segura):
#   CloudFront → S3 → EC2 → AMI/Snapshots → RDS → DB Subnet Group →
#   Security Groups → VPC (subnets, IGW, route tables) →
#   Secrets Manager → IAM Role/Profile → Key Pair → Billing Alarm + SNS

set -euo pipefail
export AWS_PAGER=""

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

APP="panela-de-barro"
REGION="us-east-1"

run() {
    if $DRY_RUN; then
        echo -e "${YELLOW}[DRY-RUN]${NC} $*"
    else
        eval "$@"
    fi
}

echo -e "${YELLOW}=== Limpeza AWS — Panela de Barro ===${NC}"
$DRY_RUN && echo -e "${YELLOW}Modo dry-run: nenhuma ação será executada.${NC}\n"

# ---------- CloudFront ----------
echo ""
echo "[1/12] Buscando distribuições CloudFront (${APP})..."
DIST_IDS=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?starts_with(Comment, '${APP}')].Id" \
  --output text 2>/dev/null || echo "")
[[ "$DIST_IDS" == "None" ]] && DIST_IDS=""

if [[ -n "$DIST_IDS" ]]; then
    for DIST_ID in $DIST_IDS; do
        echo -e "${RED}Desabilitando e deletando distribuição: $DIST_ID${NC}"
        if $DRY_RUN; then
            echo -e "${YELLOW}[DRY-RUN]${NC} disable + delete distribution $DIST_ID"
            continue
        fi
        ETAG=$(aws cloudfront get-distribution-config --id "$DIST_ID" \
          --query "ETag" --output text)
        aws cloudfront get-distribution-config --id "$DIST_ID" \
          --query "DistributionConfig" > /tmp/cf-config.json
        # Desabilita
        python3 -c "import json; c=json.load(open('/tmp/cf-config.json')); c['Enabled']=False; json.dump(c, open('/tmp/cf-config.json','w'))"
        aws cloudfront update-distribution --id "$DIST_ID" \
          --distribution-config file:///tmp/cf-config.json \
          --if-match "$ETAG" >/dev/null
        echo "    Aguardando distribuição ficar 'Deployed' (~10-15 min)..."
        aws cloudfront wait distribution-deployed --id "$DIST_ID"
        ETAG=$(aws cloudfront get-distribution-config --id "$DIST_ID" \
          --query "ETag" --output text)
        aws cloudfront delete-distribution --id "$DIST_ID" --if-match "$ETAG"
        echo -e "${GREEN}Distribuição deletada: $DIST_ID${NC}"
    done
else
    echo "Nenhuma distribuição encontrada."
fi

# OAC
OAC_ID=$(aws cloudfront list-origin-access-controls \
  --query "OriginAccessControlList.Items[?Name=='${APP}-oac'].Id | [0]" --output text 2>/dev/null || echo "None")
if [[ "$OAC_ID" != "None" && -n "$OAC_ID" ]]; then
    if ! $DRY_RUN; then
        OAC_ETAG=$(aws cloudfront get-origin-access-control --id "$OAC_ID" --query "ETag" --output text 2>/dev/null || echo "")
        [[ -n "$OAC_ETAG" ]] && aws cloudfront delete-origin-access-control --id "$OAC_ID" --if-match "$OAC_ETAG" 2>/dev/null || true
    fi
    echo -e "${GREEN}OAC removido.${NC}"
fi

# ---------- S3 ----------
echo ""
echo "[2/12] Buscando bucket S3 do frontend..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET="${APP}-web-${ACCOUNT_ID}"
if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
    echo -e "${RED}Esvaziando e deletando bucket: $BUCKET${NC}"
    run "aws s3 rm s3://${BUCKET} --recursive"
    run "aws s3api delete-bucket --bucket ${BUCKET} --region ${REGION}"
    echo -e "${GREEN}Bucket deletado.${NC}"
else
    echo "Bucket não encontrado: $BUCKET"
fi

# ---------- EC2 ----------
echo ""
echo "[3/12] Buscando instâncias EC2 (tag App=${APP})..."
INSTANCE_IDS=$(aws ec2 describe-instances --region "$REGION" \
  --filters "Name=tag:App,Values=${APP}" \
            "Name=instance-state-name,Values=running,stopped,stopping" \
  --query "Reservations[*].Instances[*].InstanceId" \
  --output text)
INSTANCE_IDS=$(echo $INSTANCE_IDS)  # achata newlines/tabs em espaços (eval-safe)

if [[ -n "$INSTANCE_IDS" ]]; then
    echo -e "${RED}Terminando EC2:${NC} $INSTANCE_IDS"
    run "aws ec2 terminate-instances --region $REGION --instance-ids $INSTANCE_IDS --output table"
    if ! $DRY_RUN; then
        echo "Aguardando término..."
        aws ec2 wait instance-terminated --region "$REGION" --instance-ids $INSTANCE_IDS
        echo -e "${GREEN}EC2 terminada.${NC}"
    fi
else
    echo "Nenhuma instância encontrada."
fi

# ---------- Elastic IP ----------
# EIP não associado GERA custo. Libera após terminar a EC2 (terminate já desassocia).
EIP_ALLOC_ID=$(aws ec2 describe-addresses --region "$REGION" \
  --filters "Name=tag:App,Values=${APP}" \
  --query "Addresses[0].AllocationId" --output text 2>/dev/null || echo "None")
if [[ "$EIP_ALLOC_ID" != "None" && -n "$EIP_ALLOC_ID" ]]; then
    echo -e "${RED}Liberando Elastic IP: $EIP_ALLOC_ID${NC}"
    run "aws ec2 release-address --region $REGION --allocation-id $EIP_ALLOC_ID"
    echo -e "${GREEN}Elastic IP liberado.${NC}"
else
    echo "Nenhum Elastic IP do projeto encontrado."
fi

# ---------- AMIs (Golden Images) + Snapshots ----------
echo ""
echo "[4/12] Buscando AMIs (Golden Images) e snapshots (tag App=${APP})..."
AMI_IDS=$(aws ec2 describe-images --region "$REGION" --owners self \
  --filters "Name=tag:App,Values=${APP}" \
  --query "Images[*].ImageId" --output text)

for AMI_ID in $AMI_IDS; do
    echo -e "${RED}Desregistrando AMI: $AMI_ID${NC}"
    run "aws ec2 deregister-image --region $REGION --image-id $AMI_ID"
done

SNAP_IDS=$(aws ec2 describe-snapshots --region "$REGION" --owner-ids self \
  --filters "Name=tag:App,Values=${APP}" \
  --query "Snapshots[*].SnapshotId" --output text)

for SNAP_ID in $SNAP_IDS; do
    echo -e "${RED}Deletando snapshot: $SNAP_ID${NC}"
    run "aws ec2 delete-snapshot --region $REGION --snapshot-id $SNAP_ID 2>/dev/null || true"
done
[[ -z "$AMI_IDS$SNAP_IDS" ]] && echo "Nenhuma AMI/snapshot encontrada."

# ---------- RDS ----------
echo ""
echo "[5/12] Buscando instância RDS (${APP}-db)..."
RDS_STATUS=$(aws rds describe-db-instances --region "$REGION" \
  --db-instance-identifier "${APP}-db" \
  --query "DBInstances[0].DBInstanceStatus" --output text 2>/dev/null || echo "not-found")

if [[ "$RDS_STATUS" != "not-found" && "$RDS_STATUS" != "None" ]]; then
    echo -e "${RED}Deletando RDS ${APP}-db (status: $RDS_STATUS)...${NC}"
    run "aws rds delete-db-instance --region $REGION \
      --db-instance-identifier ${APP}-db \
      --skip-final-snapshot \
      --delete-automated-backups"
    if ! $DRY_RUN; then
        echo "Aguardando deleção do RDS (~5-10 min)..."
        aws rds wait db-instance-deleted --region "$REGION" \
          --db-instance-identifier "${APP}-db"
        echo -e "${GREEN}RDS deletado.${NC}"
    fi
else
    echo "RDS não encontrado."
fi

# ---------- DB Subnet Group ----------
echo ""
echo "[6/12] Buscando DB Subnet Group (${APP}-subnet-group)..."
SUBNET_GROUP=$(aws rds describe-db-subnet-groups --region "$REGION" \
  --query "DBSubnetGroups[?DBSubnetGroupName=='${APP}-subnet-group'].DBSubnetGroupName" \
  --output text 2>/dev/null || echo "")

if [[ -n "$SUBNET_GROUP" ]]; then
    echo -e "${RED}Deletando subnet group: $SUBNET_GROUP${NC}"
    run "aws rds delete-db-subnet-group --region $REGION --db-subnet-group-name ${APP}-subnet-group"
    echo -e "${GREEN}Subnet group deletado.${NC}"
else
    echo "Subnet group não encontrado."
fi

# ---------- Localiza a VPC do projeto ----------
VPC_ID=$(aws ec2 describe-vpcs --region "$REGION" \
  --filters "Name=tag:App,Values=${APP}" "Name=cidr,Values=10.0.0.0/16" \
  --query "Vpcs[0].VpcId" --output text 2>/dev/null || echo "None")

# ---------- Security Groups ----------
echo ""
echo "[7/12] Buscando Security Groups (${APP}-ec2-sg, ${APP}-rds-sg)..."
for SG_NAME in "${APP}-rds-sg" "${APP}-ec2-sg"; do
    SG_ID=$(aws ec2 describe-security-groups --region "$REGION" \
      --filters "Name=group-name,Values=${SG_NAME}" "Name=vpc-id,Values=$VPC_ID" \
      --query "SecurityGroups[0].GroupId" --output text 2>/dev/null || echo "None")

    if [[ "$SG_ID" != "None" && -n "$SG_ID" ]]; then
        echo -e "${RED}Deletando SG: $SG_NAME ($SG_ID)${NC}"
        run "aws ec2 delete-security-group --region $REGION --group-id $SG_ID"
        echo -e "${GREEN}Deletado: $SG_NAME${NC}"
    else
        echo "SG não encontrado: $SG_NAME"
    fi
done

# ---------- VPC teardown ----------
echo ""
echo "[8/12] Desmontando VPC ($VPC_ID)..."
if [[ "$VPC_ID" != "None" && -n "$VPC_ID" ]]; then
    # Internet Gateway: detach + delete
    IGW_ID=$(aws ec2 describe-internet-gateways --region "$REGION" \
      --filters "Name=attachment.vpc-id,Values=$VPC_ID" \
      --query "InternetGateways[0].InternetGatewayId" --output text 2>/dev/null || echo "None")
    if [[ "$IGW_ID" != "None" && -n "$IGW_ID" ]]; then
        echo -e "${RED}Removendo IGW: $IGW_ID${NC}"
        run "aws ec2 detach-internet-gateway --region $REGION --internet-gateway-id $IGW_ID --vpc-id $VPC_ID"
        run "aws ec2 delete-internet-gateway --region $REGION --internet-gateway-id $IGW_ID"
    fi

    # Subnets
    SUBNET_IDS=$(aws ec2 describe-subnets --region "$REGION" \
      --filters "Name=vpc-id,Values=$VPC_ID" \
      --query "Subnets[*].SubnetId" --output text)
    for SUBNET_ID in $SUBNET_IDS; do
        echo -e "${RED}Deletando subnet: $SUBNET_ID${NC}"
        run "aws ec2 delete-subnet --region $REGION --subnet-id $SUBNET_ID"
    done

    # Route tables (exceto a main)
    RTB_IDS=$(aws ec2 describe-route-tables --region "$REGION" \
      --filters "Name=vpc-id,Values=$VPC_ID" \
      --query "RouteTables[?Associations[0].Main!=\`true\`].RouteTableId" --output text)
    for RTB_ID in $RTB_IDS; do
        echo -e "${RED}Deletando route table: $RTB_ID${NC}"
        run "aws ec2 delete-route-table --region $REGION --route-table-id $RTB_ID"
    done

    echo -e "${RED}Deletando VPC: $VPC_ID${NC}"
    run "aws ec2 delete-vpc --region $REGION --vpc-id $VPC_ID"
    echo -e "${GREEN}VPC desmontada.${NC}"
else
    echo "VPC do projeto não encontrada."
fi

# ---------- Secrets Manager ----------
echo ""
echo "[9/12] Deletando secret (${APP}/db-credentials)..."
SECRET_EXISTS=$(aws secretsmanager describe-secret --region "$REGION" \
  --secret-id "${APP}/db-credentials" \
  --query "Name" --output text 2>/dev/null || echo "")

if [[ -n "$SECRET_EXISTS" ]]; then
    echo -e "${RED}Deletando secret: ${APP}/db-credentials${NC}"
    run "aws secretsmanager delete-secret --region $REGION \
      --secret-id ${APP}/db-credentials \
      --force-delete-without-recovery"
    echo -e "${GREEN}Secret deletado.${NC}"
else
    echo "Secret não encontrado."
fi

# ---------- IAM ----------
echo ""
echo "[10/12] Limpando IAM Role/Profile (${APP}-ec2-role)..."

PROFILE_EXISTS=$(aws iam get-instance-profile \
  --instance-profile-name "${APP}-ec2-profile" \
  --query "InstanceProfile.InstanceProfileName" --output text 2>/dev/null || echo "")

if [[ -n "$PROFILE_EXISTS" ]]; then
    run "aws iam remove-role-from-instance-profile \
      --instance-profile-name ${APP}-ec2-profile \
      --role-name ${APP}-ec2-role 2>/dev/null || true"
    run "aws iam delete-instance-profile --instance-profile-name ${APP}-ec2-profile"
    echo -e "${GREEN}Instance profile deletado.${NC}"
else
    echo "Instance profile não encontrado."
fi

ROLE_EXISTS=$(aws iam get-role --role-name "${APP}-ec2-role" \
  --query "Role.RoleName" --output text 2>/dev/null || echo "")

if [[ -n "$ROLE_EXISTS" ]]; then
    run "aws iam delete-role-policy \
      --role-name ${APP}-ec2-role \
      --policy-name ${APP}-secrets-access 2>/dev/null || true"
    run "aws iam delete-role --role-name ${APP}-ec2-role"
    echo -e "${GREEN}IAM role deletada.${NC}"
else
    echo "IAM role não encontrada."
fi

# ---------- Key Pair ----------
echo ""
echo "[11/12] Buscando Key Pair (panela-prod-key)..."
KEY_EXISTS=$(aws ec2 describe-key-pairs --region "$REGION" \
  --filters "Name=key-name,Values=panela-prod-key" \
  --query "KeyPairs[0].KeyName" --output text 2>/dev/null || echo "None")

if [[ "$KEY_EXISTS" != "None" && -n "$KEY_EXISTS" ]]; then
    echo -e "${RED}Deletando key pair: $KEY_EXISTS${NC}"
    run "aws ec2 delete-key-pair --region $REGION --key-name panela-prod-key"
    run "rm -f ~/.ssh/panela-prod-key.pem"
    echo -e "${GREEN}Key pair deletada.${NC}"
else
    echo "Key pair não encontrada."
fi

# ---------- Billing Alarm + SNS ----------
# Não geram custo (Free Tier cobre), mas removemos para não deixar órfãos.
echo ""
echo "[12/12] Buscando Billing Alarm + tópico SNS..."
ALARM_PREFIX="${APP}-billing-over-"
ALARM_NAMES=$(aws cloudwatch describe-alarms --region "$REGION" \
  --alarm-name-prefix "$ALARM_PREFIX" \
  --query "MetricAlarms[*].AlarmName" --output text 2>/dev/null || echo "")
[[ "$ALARM_NAMES" == "None" ]] && ALARM_NAMES=""

if [[ -n "$ALARM_NAMES" ]]; then
    echo -e "${RED}Deletando alarme(s): $ALARM_NAMES${NC}"
    run "aws cloudwatch delete-alarms --region $REGION --alarm-names $ALARM_NAMES"
    echo -e "${GREEN}Alarme(s) deletado(s).${NC}"
else
    echo "Nenhum billing alarm encontrado."
fi

TOPIC_ARN=$(aws sns list-topics --region "$REGION" \
  --query "Topics[?contains(TopicArn, '${APP}-billing-alerts')].TopicArn" \
  --output text 2>/dev/null || echo "")
[[ "$TOPIC_ARN" == "None" ]] && TOPIC_ARN=""

if [[ -n "$TOPIC_ARN" ]]; then
    echo -e "${RED}Deletando tópico SNS: $TOPIC_ARN${NC}"
    run "aws sns delete-topic --region $REGION --topic-arn $TOPIC_ARN"
    echo -e "${GREEN}Tópico SNS deletado.${NC}"
else
    echo "Nenhum tópico SNS de billing encontrado."
fi

# ---------- Fim ----------
echo ""
echo -e "${GREEN}=== Limpeza concluída ===${NC}"
echo "Verifique no console AWS se há recursos residuais com cobrança:"
echo "  - Elastic IPs não associados"
echo "  - Snapshots EBS/RDS órfãos"
echo "  - NAT Gateways (este projeto NÃO cria NAT)"
