$ErrorActionPreference = "Continue"
$Output = @()
$Output += "=== Starting Deployment ==="
$Output += "Time: $(Get-Date)"

# Navigate to project
Set-Location "C:\Users\hp\.ms-ad"
$Output += "Location: $(Get-Location)"

# Check git status
$Output += "`n=== Git Status ==="
$Output += git status 2>&1

# Check changes
$Output += "`n=== Git Diff Stats ==="
$Output += git diff --stat 2>&1

# Stage and commit
$Output += "`n=== Committing Changes ==="
git add -A 2>&1 | Out-Null
$Output += git commit -m "Redeploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>&1

# Push to trigger Vercel
$Output += "`n=== Pushing to GitHub ==="
$Output += git push 2>&1

# Output results
$Output | Out-File -FilePath "$env:TEMP\deploy_output.txt" -Encoding UTF8
Write-Output $Output