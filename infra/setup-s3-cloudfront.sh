#!/bin/bash
# Frontend estático em S3 + distribuição via CloudFront (HTTPS obrigatório).
#
# Arquitetura de origens da distribuição:
#   - Default (/*)   -> S3 (arquivos estáticos do React, privado via OAC)
#   - /api/*         -> EC2 (backend FastAPI, origem HTTP na porta 80)
# CloudFront entrega tudo no mesmo domínio HTTPS — sem mixed content.
# viewer-protocol-policy: redirect-to-https em todos os comportamentos.
#
# Uso:
#   EC2_PUBLIC_IP=<ip-da-ec2> bash infra/setup-s3-cloudfront.sh
#
# Variáveis opcionais:
#   BUCKET   — nome do bucket (padrão: panela-de-barro-web-<account-id>)

set -e
export AWS_PAGER=""

REGION="us-east-1"
APP="panela-de-barro"

EC2_PUBLIC_IP="${EC2_PUBLIC_IP:-}"

# CloudFront não aceita IP como origem — precisa do nome DNS público da EC2.
# Localiza a instância (por IP informado ou pela tag do projeto) e extrai o DNS.
if [ -n "$EC2_PUBLIC_IP" ]; then
  INSTANCE_FILTER=("Name=ip-address,Values=${EC2_PUBLIC_IP}")
else
  INSTANCE_FILTER=("Name=tag:App,Values=${APP}")
fi

read -r EC2_PUBLIC_IP EC2_DNS <<<"$(aws ec2 describe-instances --region "$REGION" \
  --filters "${INSTANCE_FILTER[@]}" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].[PublicIpAddress,PublicDnsName]" \
  --output text 2>/dev/null || echo "")"

if [ -z "$EC2_DNS" ] || [ "$EC2_DNS" = "None" ]; then
  echo "ERRO: não foi possível resolver o DNS público da EC2."
  echo "Verifique se a instância está running. Uso: EC2_PUBLIC_IP=<ip> bash infra/setup-s3-cloudfront.sh"
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET="${BUCKET:-${APP}-web-${ACCOUNT_ID}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(cd "$SCRIPT_DIR/../web" && pwd)"

echo ""
echo "============================================="
echo "  Frontend S3 + CloudFront — Panela de Barro"
echo "============================================="
echo "  Bucket  : $BUCKET"
echo "  Backend : http://${EC2_PUBLIC_IP} (origem /api/*)"
echo ""

# ---------- [1/6] Build do frontend ----------
echo "==> [1/6] Buildando frontend (VITE_API_URL=/api)..."
# Carrega o NVM caso o script tenha sido invocado sem o bash_profile
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  \. "$NVM_DIR/nvm.sh"
fi

( cd "$WEB_DIR" && npm install && VITE_API_URL=/api npm run build )
DIST_DIR="$WEB_DIR/dist"
[ -d "$DIST_DIR" ] || { echo "ERRO: build não gerou $DIST_DIR"; exit 1; }

# ---------- [2/6] Bucket S3 privado ----------
echo "==> [2/6] Criando bucket S3 privado..."
if ! aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  aws s3api create-bucket --region "$REGION" --bucket "$BUCKET"
fi
aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
aws s3api put-bucket-tagging --bucket "$BUCKET" \
  --tagging "TagSet=[{Key=App,Value=${APP}}]"

# ---------- [3/6] Upload dos estáticos ----------
echo "==> [3/6] Enviando arquivos estáticos..."
aws s3 sync "$DIST_DIR" "s3://${BUCKET}" --delete

# ---------- [4/6] Origin Access Control (OAC) ----------
echo "==> [4/6] Criando Origin Access Control..."
OAC_ID=$(aws cloudfront list-origin-access-controls \
  --query "OriginAccessControlList.Items[?Name=='${APP}-oac'].Id | [0]" --output text 2>/dev/null || echo "None")
if [ "$OAC_ID" = "None" ] || [ -z "$OAC_ID" ]; then
  OAC_ID=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config "{
      \"Name\": \"${APP}-oac\",
      \"Description\": \"OAC ${APP} S3\",
      \"SigningProtocol\": \"sigv4\",
      \"SigningBehavior\": \"always\",
      \"OriginAccessControlOriginType\": \"s3\"
    }" --query "OriginAccessControl.Id" --output text)
fi
echo "    OAC: $OAC_ID"

# ---------- [5/6] Distribuição CloudFront ----------
echo "==> [5/6] Criando distribuição CloudFront (HTTPS, 2 origens)..."
S3_DOMAIN="${BUCKET}.s3.${REGION}.amazonaws.com"
CALLER_REF="${APP}-$(date +%s)"

DIST_CONFIG=$(cat <<JSON
{
  "CallerReference": "${CALLER_REF}",
  "Comment": "${APP} frontend (S3) + API (EC2)",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 2,
    "Items": [
      {
        "Id": "s3-static",
        "DomainName": "${S3_DOMAIN}",
        "OriginAccessControlId": "${OAC_ID}",
        "S3OriginConfig": { "OriginAccessIdentity": "" }
      },
      {
        "Id": "ec2-api",
        "DomainName": "${EC2_DNS}",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": { "Quantity": 1, "Items": ["TLSv1.2"] }
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "s3-static",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"] },
    "Compress": true,
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6"
  },
  "CacheBehaviors": {
    "Quantity": 1,
    "Items": [
      {
        "PathPattern": "/api/*",
        "TargetOriginId": "ec2-api",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
          "Quantity": 7,
          "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
          "CachedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"] }
        },
        "Compress": true,
        "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
        "OriginRequestPolicyId": "216adef6-5c7f-47e4-b989-5492eafa07d3"
      }
    ]
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      { "ErrorCode": 403, "ResponseCode": "200", "ResponsePagePath": "/index.html", "ErrorCachingMinTTL": 10 },
      { "ErrorCode": 404, "ResponseCode": "200", "ResponsePagePath": "/index.html", "ErrorCachingMinTTL": 10 }
    ]
  }
}
JSON
)

CREATE_OUT=$(aws cloudfront create-distribution --distribution-config "$DIST_CONFIG")
DIST_ID=$(echo "$CREATE_OUT" | python3 -c "import json,sys; print(json.load(sys.stdin)['Distribution']['Id'])")
DIST_DOMAIN=$(echo "$CREATE_OUT" | python3 -c "import json,sys; print(json.load(sys.stdin)['Distribution']['DomainName'])")

aws cloudfront tag-resource \
  --resource "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DIST_ID}" \
  --tags "Items=[{Key=App,Value=${APP}}]" 2>/dev/null || true

echo "    Distribuição: $DIST_ID ($DIST_DOMAIN)"

# ---------- [6/6] Bucket policy: só CloudFront (OAC) lê ----------
echo "==> [6/6] Aplicando bucket policy (acesso só via CloudFront)..."
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontOAC",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::${BUCKET}/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DIST_ID}"
      }
    }
  }]
}
EOF
aws s3api put-bucket-policy --bucket "$BUCKET" --policy file:///tmp/bucket-policy.json

echo ""
echo "============================================="
echo "  FRONTEND PUBLICADO"
echo "============================================="
echo "  Bucket S3   : $BUCKET (privado, só CloudFront)"
echo "  Distribuição: $DIST_ID"
echo "  URL (HTTPS) : https://${DIST_DOMAIN}"
echo ""
echo "  Propagação da CDN leva ~10-15 min."
echo "  HTTP é redirecionado para HTTPS automaticamente."
echo ""
echo "  IMPORTANTE: libere a porta 80 da EC2 para o CloudFront"
echo "  buscar /api/* (já está aberta a 0.0.0.0/0 no setup-rds.sh)."
echo "============================================="
