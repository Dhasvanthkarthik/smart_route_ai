# Push to GitHub Script
# This script will initialize a git repo and push to the specified repository.

$repoUrl = "https://github.com/Dhasvanthkarthik/smart_route_ai"
$git = "C:\Program Files\Git\cmd\git.exe"

if (!(Test-Path $git)) {
    Write-Host "Error: Git not found at $git" -ForegroundColor Red
    exit
}

Write-Host "Configuring Git..." -ForegroundColor Cyan
& $git config --global user.name "Dhasvanthkarthik"
& $git config --global user.email "dhasvanthkarthik@users.noreply.github.com"

Write-Host "Initializing Git repository..." -ForegroundColor Cyan
& $git init

Write-Host "Adding files..." -ForegroundColor Cyan
& $git add .

Write-Host "Committing changes..." -ForegroundColor Cyan
& $git commit -m "Initial commit: Smart Route AI Logistics System"

Write-Host "Setting up remote..." -ForegroundColor Cyan
& $git remote add origin $repoUrl 2>$null
& $git remote set-url origin $repoUrl

Write-Host "Pushing to GitHub (Force)..." -ForegroundColor Cyan
& $git branch -M main
& $git push -u origin main --force

Write-Host "Done! Your code should now be on GitHub." -ForegroundColor Green
