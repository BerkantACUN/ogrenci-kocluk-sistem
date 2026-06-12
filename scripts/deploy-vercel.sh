#!/usr/bin/env bash
# Vercel'e otomatik deploy. Kullanım: bash scripts/deploy-vercel.sh <VERCEL_TOKEN>
set -e
cd "$(dirname "$0")/.." # proje kökü
TOKEN="${1:-$VERCEL_TOKEN}"
if [ -z "$TOKEN" ]; then echo "VERCEL_TOKEN gerekli (argüman)."; exit 1; fi

URL="https://pzrasxjnpzxqaeqlbmzp.supabase.co"
ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmFzeGpucHp4cWFlcWxibXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNjY5MzYsImV4cCI6MjA5Njg0MjkzNn0.5ESxOXrOYXjoOgFn-9O9pCxipu2ktYeoyhR36XIiHb8"

echo "== 1) Proje bağlanıyor =="
vercel link --yes --token "$TOKEN"

echo "== 2) Env değişkenleri (idempotent) =="
add_env () {
  local name="$1"; local val="$2"; local env="$3"
  vercel env rm "$name" "$env" --yes --token "$TOKEN" >/dev/null 2>&1 || true
  printf '%s' "$val" | vercel env add "$name" "$env" --token "$TOKEN"
}
for ENVN in production preview development; do
  add_env NEXT_PUBLIC_SUPABASE_URL "$URL" "$ENVN"
  add_env NEXT_PUBLIC_SUPABASE_ANON_KEY "$ANON" "$ENVN"
done

echo "== 3) Production deploy =="
vercel deploy --prod --yes --token "$TOKEN"
