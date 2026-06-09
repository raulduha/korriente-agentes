# Levanta backend (FastAPI :8000) y frontend (Next.js :3000) en ventanas separadas.
# Uso:  powershell -ExecutionPolicy Bypass -File scripts\start.ps1
# Requisitos: Python 3.10+ y Node.js instalados.

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host "Korriente Agentes — iniciando backend y frontend..." -ForegroundColor Green

# --- BACKEND (FastAPI) en una ventana nueva ---
$backendCmd = @"
Set-Location '$backend'
Write-Host 'Instalando dependencias del backend...' -ForegroundColor Cyan
pip install -e '.[dev]'
Write-Host 'Backend en http://localhost:8000  (docs: /docs)' -ForegroundColor Green
uvicorn app.main:app --reload
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# --- FRONTEND (Next.js) en una ventana nueva ---
$frontendCmd = @"
Set-Location '$frontend'
if (-Not (Test-Path 'node_modules')) {
  Write-Host 'Instalando dependencias del frontend...' -ForegroundColor Cyan
  npm install
}
Write-Host 'Frontend en http://localhost:3000  (panel: /dashboard)' -ForegroundColor Green
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Start-Sleep -Seconds 3
Write-Host ""
Write-Host "Listo. Se abrieron 2 ventanas:" -ForegroundColor Green
Write-Host "  Backend : http://localhost:8000"
Write-Host "  Frontend: http://localhost:3000   (panel en /dashboard)"
Write-Host "Cierra esas ventanas para detener los servidores."
