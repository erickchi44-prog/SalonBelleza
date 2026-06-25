#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="diavqfstjgavwmpbceqj"

echo "=== Vinculando proyecto Supabase ==="
supabase link --project-ref "$PROJECT_REF"

echo ""
echo "=== Seteando secrets ==="
echo "Ingresa tus valores (dejalos vacios para saltar):"
read -rp "RESEND_API_KEY: " resend_key
[ -n "$resend_key" ] && supabase secrets set RESEND_API_KEY="$resend_key"

read -rp "FROM_EMAIL (default: onboarding@resend.dev): " from_email
from_email="${from_email:-onboarding@resend.dev}"
supabase secrets set FROM_EMAIL="$from_email"

read -rp "FROM_NAME (default: Aura Luxe Salon): " from_name
from_name="${from_name:-Aura Luxe Salon}"
supabase secrets set FROM_NAME="$from_name"

echo ""
echo "=== Desplegando Edge Functions ==="
for fn in booking-confirmation appointment-status-change feedback-thankyou welcome-email send-reminders; do
  echo "  → Desplegando $fn..."
  supabase functions deploy "$fn"
done

echo ""
echo "✅ Todas las funciones desplegadas exitosamente"
echo ""
echo "Ahora configura los webhooks en Supabase Dashboard:"
echo "  1. Ir a Database → Webhooks"
echo "  2. Crear webhook para cada funcion:"
echo ""
echo "  booking-confirmation   → appointments   INSERT"
echo "  appointment-status-change → appointments UPDATE"
echo "  feedback-thankyou      → feedback       INSERT"
echo "  welcome-email          → profiles       INSERT"
echo ""
echo "  URL: https://$PROJECT_REF.supabase.co/functions/v1/{function-name}"
echo "  Method: POST"
