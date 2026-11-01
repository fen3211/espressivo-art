@echo off
setlocal enabledelayedexpansion
title espressivo ART Platform [5173]

cd /d "%~dp0"

echo ========================================================
echo   espressivo ART - International Competition Platform
echo ========================================================
echo.

:: 1. Auto-update from Git repository
echo [*] Checking for updates (git pull)...
where git >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    git pull --ff-only
    if %ERRORLEVEL% NEQ 0 (
        echo [!] Git pull encountered issues or local changes. Continuing with current version...
    )
) else (
    echo [!] Git not found in PATH. Skipping auto-update.
)
echo.

:: 2. Check Node.js runtime
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js (v18+) from https://nodejs.org/
    pause
    exit /b 1
)

:: 3. Verify node_modules
if not exist "node_modules\" (
    echo [*] Installing dependencies (npm install)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
)

:: 4. Verify Prisma Client & Database
if not exist "prisma\dev.db" (
    echo [*] Initializing database (prisma db push ^& seed)...
    call npx prisma db push
    call node prisma/seed.js
) else (
    echo [*] Syncing Prisma client...
    call npx prisma generate >nul 2>&1
)

:: 5. Open browser at http://127.0.0.1:5173/ (not localhost)
echo.
echo [*] Server URL: http://127.0.0.1:5173/
echo [*] Launching browser at http://127.0.0.1:5173/ ...
start "" /min powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://127.0.0.1:5173/'"

:: 6. Start Next.js development server
echo [*] Starting Next.js development server...
echo.
call npx next dev -p 5173 -H 127.0.0.1

if %ERRORLEVEL% NEQ 0 (
    pause
)
