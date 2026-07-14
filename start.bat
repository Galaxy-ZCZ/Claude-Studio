@echo off
echo ========================================
echo    Claude Studio 启动脚本
echo ========================================
echo.

echo [1/3] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未安装 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
echo Node.js 已安装

echo.
echo [2/3] 安装依赖...
call npm install
if errorlevel 1 (
    echo 错误: 安装依赖失败
    pause
    exit /b 1
)

echo.
echo [3/3] 启动应用...
echo 应用启动后，请在新窗口中操作
echo.
call npm run electron:dev

pause
