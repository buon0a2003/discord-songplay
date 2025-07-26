#!/bin/bash

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg not found. Installing..."
    
    # Detect OS and install FFmpeg accordingly
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        if command -v apt-get &> /dev/null; then
            apt-get update && apt-get install -y ffmpeg
        # CentOS/RHEL/Amazon Linux
        elif command -v yum &> /dev/null; then
            yum install -y epel-release && yum install -y ffmpeg
        # Alpine Linux
        elif command -v apk &> /dev/null; then
            apk add --no-cache ffmpeg
        else
            echo "Unsupported Linux distribution"
            exit 1
        fi
    else
        echo "Unsupported operating system"
        exit 1
    fi
else
    echo "FFmpeg is already installed"
fi

# Verify FFmpeg installation
ffmpeg -version

# Start the Discord bot
npm start 