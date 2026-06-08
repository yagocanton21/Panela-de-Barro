#!/bin/bash
# Billing Alarm de governança financeira (Free Tier).
#
# Cria um alarme do CloudWatch que dispara quando a fatura estimada da conta
# ultrapassa um limite (padrão: US$ 5.00). A notificação é enviada por e-mail
# via SNS — confirme a inscrição clicando no link que a AWS manda.
#
# IMPORTANTE: as métricas de faturamento (AWS/Billing → EstimatedCharges) só
# existem na região us-east-1 (N. Virginia). O alarme é criado lá mesmo que o
# resto da infra esteja em outra região.
#
# Pré-requisito (uma vez, no console): Billing → Billing Preferences →
# marcar "Receive CloudWatch billing alerts". Sem isso a métrica não é populada.
#
# Uso:
#   ALERT_EMAIL=voce@exemplo.com bash infra/setup-billing-alarm.sh
#
# Variáveis opcionais:
#   THRESHOLD   — valor em USD que dispara o alarme (padrão: 5)

set -euo pipefail
export AWS_PAGER=""

# Faturamento só é consolidado em us-east-1 — não mudar.
REGION="us-east-1"
APP="panela-de-barro"
THRESHOLD="${THRESHOLD:-5}"
ALERT_EMAIL="${ALERT_EMAIL:-yagocanton123@gmail.com}"

TOPIC_NAME="${APP}-billing-alerts"
ALARM_NAME="${APP}-billing-over-${THRESHOLD}usd"

if [ -z "$ALERT_EMAIL" ]; then
  echo "ERRO: ALERT_EMAIL é obrigatório (para receber a notificação do alarme)."
  echo "Uso: ALERT_EMAIL=voce@exemplo.com bash infra/setup-billing-alarm.sh"
  exit 1
fi

echo ""
echo "============================================="
echo "  Billing Alarm — Panela de Barro"
echo "  Limite: US\$ ${THRESHOLD}.00 | Região: ${REGION}"
echo "============================================="
echo ""

# ---------- Tópico SNS + inscrição por e-mail ----------
echo "==> Criando/obtendo tópico SNS ($TOPIC_NAME)..."
TOPIC_ARN=$(aws sns create-topic --region "$REGION" --name "$TOPIC_NAME" \
  --query "TopicArn" --output text)
echo "    TopicArn: $TOPIC_ARN"

# Só inscreve se este e-mail ainda não estiver na lista (evita duplicar).
ALREADY=$(aws sns list-subscriptions-by-topic --region "$REGION" --topic-arn "$TOPIC_ARN" \
  --query "Subscriptions[?Endpoint=='${ALERT_EMAIL}'].SubscriptionArn" --output text 2>/dev/null || echo "")

if [ -z "$ALREADY" ]; then
  echo "==> Inscrevendo $ALERT_EMAIL no tópico..."
  aws sns subscribe --region "$REGION" --topic-arn "$TOPIC_ARN" \
    --protocol email --notification-endpoint "$ALERT_EMAIL" >/dev/null
  echo "    Inscrição criada. CONFIRME pelo link no e-mail enviado pela AWS."
else
  echo "    $ALERT_EMAIL já inscrito."
fi

# ---------- Alarme do CloudWatch ----------
echo "==> Criando alarme ($ALARM_NAME)..."
# EstimatedCharges é cumulativa e atualiza ~6h; período de 6h (21600s) é o padrão.
aws cloudwatch put-metric-alarm --region "$REGION" \
  --alarm-name "$ALARM_NAME" \
  --alarm-description "Fatura estimada da conta passou de US\$ ${THRESHOLD}" \
  --namespace "AWS/Billing" \
  --metric-name "EstimatedCharges" \
  --dimensions "Name=Currency,Value=USD" \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold "$THRESHOLD" \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions "$TOPIC_ARN" \
  --tags "Key=App,Value=${APP}"

echo ""
echo "============================================="
echo "  Billing Alarm pronto."
echo "    Alarme : $ALARM_NAME"
echo "    Dispara: fatura estimada > US\$ ${THRESHOLD}.00"
echo "    E-mail : $ALERT_EMAIL (confirme a inscrição SNS)"
echo ""
echo "  Lembrete: ative 'Receive CloudWatch billing alerts' em"
echo "  Billing → Billing Preferences se ainda não fez."
echo "============================================="
