@echo off
setlocal
cd /d "%~dp0"

where pythonw >nul 2>&1
if %errorlevel%==0 (
  start "" pythonw overlay.pyw
  exit /b
)

where python >nul 2>&1
if %errorlevel%==0 (
  start "" python overlay.pyw
  exit /b
)

echo.
echo   Python was not found on your PATH.
echo   Install it from https://www.python.org/downloads/
echo   and tick "Add python.exe to PATH" during setup.
echo.
pause
