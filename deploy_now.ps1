$ErrorActionPreference = "Continue"
$logFile = "$env:TEMP\rilstack_deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

$log = @()
$log += "=== RILSTACK DEPLOY ==="
$log += "Time: $(Get-Date)"

# Git operations
$log += "`n=== Git Status ==="
Set-Location "C:\Users\hp\.ms-ad"
$log += git status --short 2>&1

$log += "`n=== Git Diff ==="
$log += git diff --stat 2>&1

$log += "`n=== Staging ==="
$log += git add -A 2>&1

$log += "`n=== Committing ==="
$log += git commit -m "Production update - $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>&1

$log += "`n=== Pushing ==="
$log += git push 2>&1

$log += "`n=== DONE ==="

# Save log
$log | Out-File -FilePath $logFile -Encoding UTF8

Write-Output $log
Write-Output "`nLog saved to: $logFile"