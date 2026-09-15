@echo off
cd /d "%~dp0"
echo Current folder:
cd
echo.
echo Checking package.json...
if exist package.json (
  echo OK: package.json exists.
) else (
  echo ERROR: package.json not found.
)
echo.
echo Node version:
node -v
echo npm version:
call npm.cmd -v
pause
