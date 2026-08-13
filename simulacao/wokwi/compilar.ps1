# Compila o sketch para o Arduino Mega e deixa o firmware pronto para o Wokwi.
#
#   .\compilar.ps1
#
# Depois: F1 no VS Code → "Wokwi: Start Simulator"

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# O arduino-cli instalado pelo winget nem sempre entra no PATH da sessão
if (-not (Get-Command arduino-cli -ErrorAction SilentlyContinue)) {
    $env:PATH += ";C:\Program Files\Arduino CLI"
}

Write-Host ""
Write-Host "  Compilando sketch.ino para Arduino Mega 2560..." -ForegroundColor Cyan
Write-Host ""

# O arduino-cli exige que a pasta tenha o mesmo nome do .ino
New-Item -ItemType Directory -Force -Path sketch | Out-Null
Copy-Item sketch.ino sketch\sketch.ino -Force

arduino-cli compile --fqbn arduino:avr:mega --output-dir build sketch

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  ERRO na compilacao." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  OK. Firmware pronto em build\sketch.ino.hex" -ForegroundColor Green
Write-Host "  Agora: F1 -> 'Wokwi: Start Simulator'" -ForegroundColor Green
Write-Host ""
