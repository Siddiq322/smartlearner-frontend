@echo off
echo Fixing SmartLearner Backend...
echo.

echo Step 1: Checking current Node.js version...
node --version
echo.

echo Step 2: Uninstalling current Node.js v24.8.0...
winget uninstall --id OpenJS.NodeJS
echo.

echo Step 3: Installing Node.js LTS (20.x)...
winget install OpenJS.NodeJS.LTS
echo.

echo Step 4: Please CLOSE and REOPEN this Command Prompt/PowerShell window
echo Then run the next commands manually:
echo.
echo cd e:\Projects\smartlearner\backend
echo npm cache clean --force
echo npm install
echo npm start
echo.
echo After backend starts, test with:
echo Invoke-WebRequest -Uri "http://localhost:5012/api/test" -UseBasicParsing
echo.
pause