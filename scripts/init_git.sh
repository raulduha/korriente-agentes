#!/usr/bin/env bash
# Inicializa git para korriente-agentes (macOS/Linux/WSL).
# Uso:  bash scripts/init_git.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[ -d .git ] && rm -rf .git

git init
git branch -M main
git add -A
git commit -m "M0: scaffold Korriente Agentes (runtime, 2 agentes, pricing/limites, tests, frontend)"
git checkout -b korriente-agentes
git branch
echo "Listo. Rama actual: korriente-agentes"
