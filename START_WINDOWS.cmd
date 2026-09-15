@echo off
cd /d "%~dp0"
echo [1/2] Installing packages...
call npm.cmd install
if errorlevel 1 (
  echo.
  echo npm install failed. Check the error above.
  pause
  exit /b 1
)
echo.
echo [2/2] Starting Next.js dev server...
call npm.cmd run dev
pause
