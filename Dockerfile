# Use the latest Node.js Alpine image
FROM node:alpine

# Install FFmpeg and other dependencies
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies using npm
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S discordbot -u 1001 -G nodejs && \
    chown -R discordbot:nodejs /app

# Switch to non-root user
USER discordbot

# Expose port (if needed for health checks)
EXPOSE 3000

# Start the bot
CMD ["npm", "start"] 