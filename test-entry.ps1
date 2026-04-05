$body = @{
    content = "Hello from PowerShell!"
    timeSpentWriting = 5000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/debug/entry" -Method Post -Body $body -ContentType "application/json"