#!/bin/bash
# Cria uma Golden Image (AMI) a partir de uma EC2 já provisionada.
#
# A AMI captura o estado pós-bootstrap (Docker + AWS CLI + stack já buildada),
# eliminando o user-data demorado nos próximos lançamentos. Use o ID retornado
# para acelerar o escalonamento horizontal:
#
#   GOLDEN_AMI_ID=<ami-id> bash infra/setup-rds.sh
#
# Uso:
#   INSTANCE_ID=<i-xxxx> bash infra/create-ami.sh
#   (se omitido, localiza a EC2 do projeto pela tag App)

set -e
export AWS_PAGER=""

REGION="us-east-1"
APP="panela-de-barro"

INSTANCE_ID="${INSTANCE_ID:-}"
if [ -z "$INSTANCE_ID" ]; then
  INSTANCE_ID=$(aws ec2 describe-instances --region "$REGION" \
    --filters "Name=tag:App,Values=${APP}" "Name=instance-state-name,Values=running,stopped" \
    --query "Reservations[0].Instances[0].InstanceId" --output text 2>/dev/null || echo "")
fi
if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" = "None" ]; then
  echo "ERRO: INSTANCE_ID não informado e nenhuma EC2 do projeto encontrada."
  echo "Uso: INSTANCE_ID=<i-xxxx> bash infra/create-ami.sh"
  exit 1
fi

AMI_NAME="${APP}-golden-$(date +%Y%m%d-%H%M%S)"

echo "==> Criando AMI '$AMI_NAME' a partir de $INSTANCE_ID..."
# --no-reboot evita parar a aplicação durante o snapshot
AMI_ID=$(aws ec2 create-image --region "$REGION" \
  --instance-id "$INSTANCE_ID" \
  --name "$AMI_NAME" \
  --description "Golden Image ${APP} (Docker + stack pré-instalada)" \
  --no-reboot \
  --tag-specifications \
    "ResourceType=image,Tags=[{Key=App,Value=${APP}},{Key=Name,Value=${AMI_NAME}}]" \
    "ResourceType=snapshot,Tags=[{Key=App,Value=${APP}}]" \
  --query "ImageId" --output text)

echo "    AMI em criação: $AMI_ID"
echo "    Aguardando ficar disponível (~5 min)..."
aws ec2 wait image-available --region "$REGION" --image-ids "$AMI_ID"

echo ""
echo "============================================="
echo "  GOLDEN IMAGE PRONTA"
echo "============================================="
echo "  AMI ID: $AMI_ID"
echo ""
echo "  Use no próximo deploy (boot acelerado):"
echo "  GOLDEN_AMI_ID=${AMI_ID} ADMIN_PASSWORD=... LICENSE_KEY=... bash infra/setup-rds.sh"
echo "============================================="
