#!/bin/bash
# Limpeza dos recursos AWS do projeto Panela de Barro
# Uso: ./infra/cleanup-aws.sh [--dry-run]

set -e
export AWS_PAGER=""

DRY_RUN=false
[[ "$1" == "--dry-run" ]] && DRY_RUN=true

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

run() {
    if $DRY_RUN; then
        echo -e "${YELLOW}[DRY-RUN]${NC} $*"
    else
        eval "$@"
    fi
}

echo -e "${YELLOW}=== Limpeza AWS — Panela de Barro ===${NC}"
$DRY_RUN && echo -e "${YELLOW}Modo dry-run: nenhuma ação será executada.${NC}\n"

# ---------- EC2 ----------
echo "Buscando instâncias EC2 (tag Name=panela-de-barro-prod)..."
INSTANCE_IDS=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=panela-de-barro-prod" \
            "Name=instance-state-name,Values=running,stopped,stopping" \
  --query "Reservations[*].Instances[*].InstanceId" \
  --output text)

if [[ -n "$INSTANCE_IDS" ]]; then
    echo -e "${RED}Terminando EC2 Panela de Barro:${NC} $INSTANCE_IDS"
    run "aws ec2 terminate-instances --instance-ids $INSTANCE_IDS --query 'TerminatingInstances[*].[InstanceId,CurrentState.Name]' --output table"
    if ! $DRY_RUN; then
        echo -e "${GREEN}Aguardando término...${NC}"
        aws ec2 wait instance-terminated --instance-ids $INSTANCE_IDS
        echo -e "${GREEN}Instância terminada.${NC}"
    fi
else
    echo "Nenhuma instância encontrada."
fi

# ---------- Key Pair ----------
echo ""
KEY_EXISTS=$(aws ec2 describe-key-pairs \
  --filters "Name=key-name,Values=panela-prod-key" \
  --query "KeyPairs[0].KeyName" --output text 2>/dev/null || echo "None")

if [[ "$KEY_EXISTS" != "None" && -n "$KEY_EXISTS" ]]; then
    echo -e "Deletando key pair: ${RED}$KEY_EXISTS${NC}"
    run "aws ec2 delete-key-pair --key-name panela-prod-key"
    run "rm -f ~/.ssh/panela-prod-key.pem"
    echo -e "${GREEN}Key pair deletada.${NC}"
else
    echo "Key pair não encontrada."
fi

# ---------- Security Groups ----------
echo ""
SG_IDS=$(aws ec2 describe-security-groups \
  --filters "Name=vpc-id,Values=vpc-02d7630f2e1b5f5cd" \
            "Name=group-name,Values=panela-web-sg,panela-db-sg" \
  --query "SecurityGroups[*].GroupId" --output text)

if [[ -n "$SG_IDS" ]]; then
    echo -e "Deletando security groups: ${RED}$SG_IDS${NC}"
    for sg in $SG_IDS; do
        run "aws ec2 delete-security-group --group-id $sg"
        echo -e "${GREEN}Deletado: $sg${NC}"
    done
else
    echo "Security groups não encontrados."
fi

# ---------- Rota Internet Gateway ----------
echo ""
ROUTE_EXISTS=$(aws ec2 describe-route-tables \
  --route-table-ids rtb-0c0bdba5f91a247bf \
  --query "RouteTables[0].Routes[?DestinationCidrBlock=='0.0.0.0/0'].GatewayId" \
  --output text 2>/dev/null || echo "")

if [[ -n "$ROUTE_EXISTS" && "$ROUTE_EXISTS" != "None" ]]; then
    echo -e "Removendo rota de internet: ${RED}0.0.0.0/0 -> $ROUTE_EXISTS${NC}"
    run "aws ec2 delete-route --route-table-id rtb-0c0bdba5f91a247bf --destination-cidr-block 0.0.0.0/0"
    echo -e "${GREEN}Rota removida.${NC}"
else
    echo "Rota de internet não encontrada."
fi

echo ""
echo -e "${GREEN}=== Limpeza concluída ===${NC}"
echo "Verifique no console AWS se há recursos residuais que gerem cobrança:"
echo "  - Elastic IPs não associados"
echo "  - NAT Gateways (cobrados por hora)"
echo "  - Snapshots EBS"
