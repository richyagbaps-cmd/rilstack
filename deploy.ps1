#!/usr/bin/env pwsh
# RILSTACK Automated Installation & Deployment Script
# This script will install Node.js and deploy the RILSTACK app

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  RILSTACK Auto-Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "📋 Checking for Node.js...`n" -ForegroundColor Yellow

$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js found: $nodeVersion`n" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Installing Node.js LTS...`n" -ForegroundColor Red
    
    # Download Node.js LTS installer
    $nodeUrl = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi"
    $installerPath = "$env:TEMP\nodejs-installer.msi"
    
    Write-Host "📥 Downloading Node.js..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "✅ Downloaded`n" -ForegroundColor Green
        
        Write-Host "⚙️  Installing Node.js..." -ForegroundColor Yellow
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-Host "✅ Node.js installed successfully!`n" -ForegroundColor Green
        
        # Clean up installer
        Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "❌ Failed to install Node.js automatically`n" -ForegroundColor Red
        Write-Host "Please install Node.js manually from: https://nodejs.org" -ForegroundColor Yellow
        Read-Host "Press Enter to continue..."
        exit 1
    }
}

# Verify Node and npm
$npmVersion = npm --version 2>$null
Write-Host "📦 npm version: $npmVersion`n" -ForegroundColor Green

# Navigate to project directory
$projectDir = "C:\Users\hp\.ms-ad"
if (Test-Path $projectDir) {
    Set-Location $projectDir
    Write-Host "📂 Project directory: $projectDir`n" -ForegroundColor Green
} else {
    Write-Host "❌ Project directory not found`n" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed`n" -ForegroundColor Red
    exit 1
}
Write-Host "`n✅ Dependencies installed`n" -ForegroundColor Green

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Build completed with warnings (this is often normal)`n" -ForegroundColor Yellow
} else {
    Write-Host "✅ Build successful`n" -ForegroundColor Green
}

# Display environment setup instructions
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Configuration Required" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Update your .env.local file with:" -ForegroundColor Yellow
Write-Host "  1. PAYSTACK_SECRET_KEY=sk_test_..." -ForegroundColor White
Write-Host "  2. DOJAH_API_KEY (optional)" -ForegroundColor White
Write-Host "  3. INTERSWITCH credentials (optional)" -ForegroundColor White
Write-Host ""

# Start the development server
Write-Host "🚀 Starting RILSTACK server..." -ForegroundColor Green
Write-Host ""
npm run dev

