#!/bin/bash
# Atualiza a regra de SSH (porta 22) do Security Group da EC2 para o IP atual.
#
# Use quando seu IP residencial dinâmico mudar e você perder o acesso SSH.
# O script: detecta o IP público atual, libera a porta 22 só para ele (/32)
# e revoga todas as regras /32 antigas da porta 22 (menor privilégio).
#
# Uso:
#   bash infra/update-ssh-ip.sh
#
# Variáveis opcionais:
#   ADMIN_IP  — força um IP específico (auto-detecta o IP público atual se omitido)
#   REGION    — região AWS (padrão: us-east-1)

set -euo pipefail

export AWS_PAGER=""

REGION="${REGION:-us-east-1}"
APP="panela-de-barro"
SG_NAME="${APP}-ec2-sg"

# ---------- Detecta o IP do admin ----------
if [ -z "${ADMIN_IP:-}" ]; then
  ADMIN_IP="$(curl -s https://checkip.amazonaws.com || true)"
fi
if [ -z "$ADMIN_IP" ]; then
  echo "ERRO: não foi possível detectar ADMIN_IP. Informe manualmente: ADMIN_IP=1.2.3.4 bash infra/update-ssh-ip.sh"
  exit 1
fi
NEW_CIDR="${ADMIN_IP}/32"

# ---------- Localiza a VPC do projeto (evita pegar SG de nome igual em outra VPC) ----------
VPC_ID=$(aws ec2 describe-vpcs --region "$REGION" \
  --filters "Name=tag:App,Values=${APP}" "Name=cidr,Values=10.0.0.0/16" \
  --query "Vpcs[0].VpcId" --output text 2>/dev/null || echo "None")

if [ -z "$VPC_ID" ] || [ "$VPC_ID" = "None" ]; then
  echo "ERRO: VPC do projeto (tag App=${APP}) não encontrada na região ${REGION}."
  echo "Rode 'bash infra/setup-rds.sh' primeiro, ou confira a REGION."
  exit 1
fi

# ---------- Localiza o Security Group da EC2 (dentro da VPC do projeto) ----------
SG_ID=$(aws ec2 describe-security-groups --region "$REGION" \
  --filters "Name=group-name,Values=${SG_NAME}" "Name=vpc-id,Values=${VPC_ID}" \
  --query "SecurityGroups[0].GroupId" --output text)

if [ -z "$SG_ID" ] || [ "$SG_ID" = "None" ]; then
  echo "ERRO: Security Group '${SG_NAME}' não encontrado na VPC ${VPC_ID} (região ${REGION})."
  echo "Rode 'bash infra/setup-rds.sh' primeiro, ou confira a REGION."
  exit 1
fi

echo "============================================="
echo "  Atualizar SSH — Panela de Barro"
echo "============================================="
echo "  Region   : $REGION"
echo "  SG       : $SG_NAME ($SG_ID)"
echo "  IP atual : $NEW_CIDR"
echo ""

# ---------- Lista os CIDRs /32 já liberados na porta 22 ----------
OLD_CIDRS=$(aws ec2 describe-security-groups --region "$REGION" \
  --group-ids "$SG_ID" \
  --query "SecurityGroups[0].IpPermissions[?FromPort==\`22\` && ToPort==\`22\`].IpRanges[].CidrIp" \
  --output text)

# ---------- Libera o IP novo (idempotente) ----------
if echo "$OLD_CIDRS" | tr '\t' '\n' | grep -qx "$NEW_CIDR"; then
  echo "==> IP atual já está liberado na porta 22. Nada a adicionar."
else
  echo "==> Liberando $NEW_CIDR na porta 22..."
  aws ec2 authorize-security-group-ingress --region "$REGION" \
    --group-id "$SG_ID" --protocol tcp --port 22 --cidr "$NEW_CIDR"
fi

# ---------- Revoga os /32 antigos da porta 22 (menos o novo) ----------
for cidr in $OLD_CIDRS; do
  # só revoga regras de host único (/32); preserva blocos maiores intencionais
  case "$cidr" in
    *"/32")
      if [ "$cidr" != "$NEW_CIDR" ]; then
        echo "==> Revogando IP antigo $cidr da porta 22..."
        aws ec2 revoke-security-group-ingress --region "$REGION" \
          --group-id "$SG_ID" --protocol tcp --port 22 --cidr "$cidr" 2>/dev/null || true
      fi
      ;;
    *)
      echo "==> Mantendo regra não-/32 na porta 22: $cidr (revise manualmente se não for intencional)."
      ;;
  esac
done

echo ""
echo "Pronto. SSH liberado apenas para: $NEW_CIDR"
echo "  ssh -i \$HOME/.ssh/panela-prod-key.pem ubuntu@<IP_DA_EC2>"
