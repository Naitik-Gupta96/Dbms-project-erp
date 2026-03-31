@echo off
setlocal

set "ROOT=C:\Users\Naitik Gupta\Desktop\dbms local\DBMS_PROJECT"
set "MONGO_BIN=C:\Users\Naitik Gupta\Desktop\dbms local\tools\mongodb\mongodb-win32-x86_64-windows-7.0.14\bin\mongod.exe"
set "MONGO_DATA=C:\Users\Naitik Gupta\Desktop\dbms local\tools\mongo-data"
set "BACKEND_DIR=%ROOT%\DBMSbackend-main"

if not exist "%MONGO_BIN%" (
  echo MongoDB binary not found at:
  echo %MONGO_BIN%
  pause
  exit /b 1
)

if not exist "%MONGO_DATA%" (
  mkdir "%MONGO_DATA%"
)

echo Starting MongoDB...
start "MongoDB" cmd /k ""%MONGO_BIN%" --dbpath "%MONGO_DATA%" --bind_ip 127.0.0.1 --port 27017"

timeout /t 3 /nobreak >nul

echo Starting Backend...
start "DBMS Backend" cmd /k "cd /d "%BACKEND_DIR%" && npm start"

echo Done. Keep both new windows open.
echo Backend URL: http://localhost:3000/
pause
