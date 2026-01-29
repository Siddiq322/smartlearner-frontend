# Test Backend Connection Script
Write-Host "Testing SmartLearner Backend Connection..." -ForegroundColor Green
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5012/api/test" -UseBasicParsing
    Write-Host "✅ Backend is responding!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend not responding" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure backend is running with: npm start" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"