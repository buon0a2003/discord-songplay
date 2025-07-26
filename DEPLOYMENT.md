# Discord Music Bot Deployment Guide

This guide will help you deploy your Discord music bot to cloud hosting platforms like Render, Heroku, Railway, or any other cloud service that supports Node.js applications.

## Prerequisites

1. **Discord Bot Token**: Get your bot token from [Discord Developer Portal](https://discord.com/developers/applications)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **FFmpeg**: Required for audio processing (handled automatically in deployment)

## Deployment Options

### Option 1: Render (Recommended)

Render provides excellent support for Node.js applications with automatic FFmpeg installation.

#### Step 1: Prepare Your Repository

1. Make sure all deployment files are in your repository:
   - `render.yaml` - Render configuration
   - `Dockerfile` - Container configuration (optional)
   - `start.sh` - Startup script with FFmpeg check
   - `.env.example` - Environment variables template

#### Step 2: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Render will automatically detect the `render.yaml` file
5. Set the following environment variables:
   - `TOKEN`: Your Discord bot token
   - `TEST_SERVER`: Your test server ID (optional)
   - `NODE_ENV`: `production`

#### Step 3: FFmpeg Installation

The deployment automatically handles FFmpeg installation through:

- **Dockerfile method**: Pre-installs FFmpeg in Alpine Linux container
- **Startup script method**: Checks and installs FFmpeg on first run

### Option 2: Heroku

#### Step 1: Create Heroku App

```bash
# Install Heroku CLI first
heroku create your-discord-bot-name

# Add FFmpeg buildpack
heroku buildpacks:add --index 1 https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git

# Add Node.js buildpack
heroku buildpacks:add --index 2 heroku/nodejs
```

#### Step 2: Set Environment Variables

```bash
heroku config:set TOKEN=your_discord_bot_token
heroku config:set TEST_SERVER=your_test_server_id
heroku config:set NODE_ENV=production
```

#### Step 3: Deploy

```bash
git push heroku main
```

### Option 3: Railway

1. Go to [Railway](https://railway.app/)
2. Create new project from GitHub repo
3. Set environment variables in Railway dashboard
4. Railway will automatically detect Node.js and install dependencies

### Option 4: Docker Deployment

Use the provided `Dockerfile` for any container-based hosting:

```bash
# Build the image
docker build -t discord-musicbot .

# Run with environment variables
docker run -d \
  -e TOKEN=your_discord_bot_token \
  -e TEST_SERVER=your_test_server_id \
  discord-musicbot
```

## Environment Variables

| Variable      | Description                          | Required |
| ------------- | ------------------------------------ | -------- |
| `TOKEN`       | Discord bot token                    | Yes      |
| `TEST_SERVER` | Guild ID for command registration    | No       |
| `NODE_ENV`    | Environment (production/development) | No       |

## FFmpeg Requirements

Your bot needs FFmpeg for audio processing. Here's how it's handled on different platforms:

### Checking FFmpeg Installation

You can verify FFmpeg is installed by running:

```bash
ffmpeg -version
```

### Manual FFmpeg Installation

If FFmpeg isn't automatically installed:

**Ubuntu/Debian:**

```bash
sudo apt update && sudo apt install ffmpeg
```

**CentOS/RHEL:**

```bash
sudo yum install epel-release && sudo yum install ffmpeg
```

**Alpine Linux:**

```bash
apk add --no-cache ffmpeg
```
