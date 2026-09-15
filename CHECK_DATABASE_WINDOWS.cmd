@echo off
setlocal
cd /d "%~dp0"

echo === DEFENSE SEMI DB CHECK ===
if not exist .env echo [WARN] .env not found
if exist .env echo [OK] .env exists
call npm.cmd run db:validate
pause
