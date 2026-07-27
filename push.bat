@echo off
chcp 65001 >nul
echo === Pushing bali-portfolio to GitHub ===
echo.

REM Set your token and repo
set TOKEN=YOUR_GITHUB_TOKEN
set REPO_URL=https://SimonLLT:%TOKEN%@github.com/SimonLLT/portfolio-website.git

REM Change to the project directory
cd /d "%~dp0"

REM Initialize git if needed
if not exist ".git" (
    echo Step 1: Initializing git repository...
    git init
    git checkout -b main
) else (
    echo Step 1: Git already initialized.
)

REM Remove old remote if exists and add new one
git remote remove origin 2>nul
git remote add origin %REPO_URL%

REM Stage all files
echo.
echo Step 2: Adding all files...
git add .

REM Commit
echo.
echo Step 3: Committing...
git commit -m "feat: bali-portfolio website with 7 project galleries"

REM Pull first (in case remote has changes)
echo.
echo Step 4: Pulling remote changes...
git pull origin main --allow-unrelated-histories -X ours

REM Push
echo.
echo Step 5: Pushing to GitHub...
git push origin main

echo.
echo === Done! ===
echo Repository: https://github.com/bubuding0824-pixel/bubuding
pause
