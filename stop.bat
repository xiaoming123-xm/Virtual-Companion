@echo off
setlocal
title ATRI Chat Stop

echo Stopping ATRI Chat...

rem Close the two terminal windows opened by start.bat.
taskkill /FI "WINDOWTITLE eq ATRI Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq ATRI Frontend*" /T /F >nul 2>&1

rem Clean up processes still listening on backend/frontend ports.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ports = 9099, 9900; " ^
  "$pids = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in $ports } | Select-Object -ExpandProperty OwningProcess -Unique; " ^
  "foreach ($processId in $pids) { taskkill.exe /PID $processId /T /F 2>$null | Out-Null }"

echo.
echo ATRI Chat has been stopped.
timeout /t 2 /nobreak >nul

endlocal