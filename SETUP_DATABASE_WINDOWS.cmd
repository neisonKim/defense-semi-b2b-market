@echo off
setlocal
cd /d "%~dp0"

echo =============================================
echo DEFENSE SEMI - Stage 09 Database Setup
echo =============================================

if not exist .env (
  echo [ERROR] .env file not found.
  echo Run: copy .env.example .env
  echo Then edit DATABASE_URL with your PostgreSQL password.
  pause
  exit /b 1
)

findstr /C:"YOUR_PASSWORD" .env >nul
if %errorlevel%==0 (
  echo [ERROR] .env still contains YOUR_PASSWORD.
  echo Edit .env before running this setup.
  pause
  exit /b 1
)

echo [1/3] Prisma schema validation
call npm.cmd run db:validate || goto :fail

echo [2/3] Create schema and seed data
call npm.cmd run db:setup || goto :fail

echo [3/3] Complete
echo Start the app with: npm.cmd run dev
echo Check: http://localhost:3000/api/db/health
pause
exit /b 0

:fail
echo.
echo [FAILED] Database setup failed. Check DATABASE_URL and PostgreSQL service.
pause
exit /b 1
