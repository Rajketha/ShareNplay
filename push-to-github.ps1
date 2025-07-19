Write-Host "ShareNPlay - Push to GitHub Helper" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Steps to push to GitHub:" -ForegroundColor Yellow
Write-Host "1. Create a new repository on GitHub" -ForegroundColor White
Write-Host "2. Copy the repository URL" -ForegroundColor White
Write-Host "3. Run the commands below" -ForegroundColor White
Write-Host ""

Write-Host "Commands to run:" -ForegroundColor Green
Write-Host "git remote add origin https://github.com/YOUR_USERNAME/ShareNPlay.git" -ForegroundColor Cyan
Write-Host "git branch -M main" -ForegroundColor Cyan
Write-Host "git push -u origin main" -ForegroundColor Cyan
Write-Host ""

Write-Host "Or if you want to use SSH:" -ForegroundColor Yellow
Write-Host "git remote add origin git@github.com:YOUR_USERNAME/ShareNPlay.git" -ForegroundColor Cyan
Write-Host "git branch -M main" -ForegroundColor Cyan
Write-Host "git push -u origin main" -ForegroundColor Cyan
Write-Host ""

Write-Host "Replace YOUR_USERNAME with your actual GitHub username!" -ForegroundColor Red
Write-Host ""

$repositoryUrl = Read-Host "Enter your GitHub repository URL (or press Enter to skip)"
if ($repositoryUrl) {
    Write-Host ""
    Write-Host "Setting up remote repository..." -ForegroundColor Yellow
    
    try {
        git remote add origin $repositoryUrl
        git branch -M main
        git push -u origin main
        
        Write-Host ""
        Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "Your repository is now available at: $repositoryUrl" -ForegroundColor Blue
    } catch {
        Write-Host ""
        Write-Host "✗ Error pushing to GitHub. Please check your repository URL and try again." -ForegroundColor Red
    }
} else {
    Write-Host "Skipped remote setup. You can run the commands manually later." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 