#!/usr/bin/env bash
# Levanta backend (FastAPI :8000) y frontend (Next.js :3000). macOS/Linux/WSL.
# Uso:  bash scripts/start.sh    (Ctrl+C detiene ambos)
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"

echo "Korriente Agentes — iniciando backend y frontend..."

# --- BACKEND ---
(
  cd "$root/backend"
  pip install -e ".[dev]" >/dev/null
  echo "Backend en http://localhost:8000 (docs: /docs)"
  uvicorn app.main:app --reload
) &
BACK_PID=$!

# --- FRONTEND ---
(
  cd "$root/frontend"
  [ -d node_modules ] || npm install
  echo "Frontend en http://localhost:3000 (panel: /dashboard)"
  npm run dev
) &
FRONT_PID=$!

# Ctrl+C detiene ambos
trap "echo 'Deteniendo...'; kill $BACK_PID $FRONT_PID 2>/dev/null || true" INT TERM
wait
