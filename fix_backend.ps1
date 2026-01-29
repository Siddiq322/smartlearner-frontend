# Fix SmartLearner Backend Script
Write-Host "Fixing SmartLearner Backend..." -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Checking current Node.js version..." -ForegroundColor Yellow
node --version
Write-Host ""

Write-Host "Step 2: Uninstalling current Node.js v24.8.0..." -ForegroundColor Yellow
winget uninstall --id OpenJS.NodeJS
Write-Host ""

Write-Host "Step 3: Installing Node.js LTS (20.x)..." -ForegroundColor Yellow
winget install OpenJS.NodeJS.LTS
Write-Host ""

Write-Host "Step 4: Please CLOSE and REOPEN PowerShell window" -ForegroundColor Red
Write-Host "Then run these commands manually:" -ForegroundColor Cyan
Write-Host ""
Write-Host "cd e:\Projects\smartlearner\backend" -ForegroundColor White
Write-Host "npm cache clean --force" -ForegroundColor White
Write-Host "npm install" -ForegroundColor White
Write-Host "npm start" -ForegroundColor White
Write-Host ""
Write-Host "After backend starts, test with:" -ForegroundColor Cyan
Write-Host "Invoke-WebRequest -Uri 'http://localhost:5012/api/test' -UseBasicParsing" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"