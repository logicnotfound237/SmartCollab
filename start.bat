@echo off
echo Starting SmartCollab Development Environment...
echo.

echo Installing dependencies...
call npm run install:all

echo.
echo Starting backend and frontend servers...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:5173
echo.

call npm run dev

