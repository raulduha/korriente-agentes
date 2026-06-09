# Inicializa git para korriente-agentes (ejecutar en Windows PowerShell, dentro de la carpeta).
# Uso:  powershell -ExecutionPolicy Bypass -File scripts\init_git.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

# Limpia cualquier .git corrupto creado previamente.
if (Test-Path ".git") { Remove-Item -Recurse -Force ".git" }

git init
git branch -M main
git add -A
git commit -m "M0: scaffold Korriente Agentes (runtime, 2 agentes, pricing/limites, tests, frontend)"

# Rama de trabajo para el desarrollo de agentes.
git checkout -b korriente-agentes

git branch
Write-Host "Listo. Rama actual: korriente-agentes"
