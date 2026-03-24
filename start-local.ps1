$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repoRoot "backend"
$frontendDir = Join-Path $repoRoot "frontend"

if (!(Test-Path $backendDir)) {
  throw "Backend directory not found: $backendDir"
}

if (!(Test-Path $frontendDir)) {
  throw "Frontend directory not found: $frontendDir"
}

Write-Host "Starting backend..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$backendDir`"; npm run start"
)

Start-Sleep -Seconds 1

Write-Host "Starting frontend..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$frontendDir`"; npm run dev"
)

Write-Host "Launched local stack." -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173 or http://localhost:5174" -ForegroundColor Green
