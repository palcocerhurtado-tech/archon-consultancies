#!/usr/bin/env bash
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "Instala Vercel CLI primero: npm i -g vercel"
  exit 1
fi

echo "Este script publica la web en Vercel y configura GEMINI_API_KEY solo en el backend."
read -r -p "¿Quieres continuar? [y/N] " confirm
case "$confirm" in
  y|Y|yes|YES) ;;
  *) echo "Cancelado."; exit 0 ;;
esac

read -r -s -p "Pega tu GEMINI_API_KEY: " GEMINI_KEY
echo
if [ -z "$GEMINI_KEY" ]; then
  echo "La clave esta vacia."
  exit 1
fi

TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT
printf '%s' "$GEMINI_KEY" > "$TMP_FILE"
unset GEMINI_KEY

vercel link

for ENV in development preview production; do
  vercel env add GEMINI_API_KEY "$ENV" --sensitive --force < "$TMP_FILE"
done

vercel deploy --prod

echo
echo "Listo. Comprueba:"
echo "  1) la home publica"
echo "  2) /api/chat devuelve configured=true"
