@echo off
setlocal
cd /d "%~dp0"

where pyw >nul 2>&1
if %errorlevel%==0 (
  start "" pyw -3 "%~dp0overlay.pyw"
  exit /b
)

where py >nul 2>&1
if %errorlevel%==0 (
  start "" py -3 "%~dp0overlay.pyw"
  exit /b
)

for /d %%D in ("%LOCALAPPDATA%\Programs\Python\Python3*") do (
  if exist "%%~fD\pythonw.exe" (
    start "" "%%~fD\pythonw.exe" "%~dp0overlay.pyw"
    exit /b
  )
)

where pythonw >nul 2>&1
if %errorlevel%==0 (
  start "" pythonw "%~dp0overlay.pyw"
  exit /b
)

echo.
echo   Could not find Python on this PC.
echo   Install it from https://www.python.org/downloads/
echo   and tick "Add python.exe to PATH" during setup.
echo.
pause
