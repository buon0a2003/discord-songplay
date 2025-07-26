@echo off

REM Check if FFmpeg is installed
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo FFmpeg not found. Please install FFmpeg manually.
    echo Download from: https://ffmpeg.org/download.html
    echo Or use chocolatey: choco install ffmpeg
    echo Or use winget: winget install FFmpeg
    pause
    exit /b 1
) else (
    echo FFmpeg is already installed
)

REM Verify FFmpeg installation
ffmpeg -version

REM Start the Discord bot
npm start 