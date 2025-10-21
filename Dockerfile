# Use official Node 20 base image (Amazon Linux compatible)
FROM node:20-bullseye

# Install required dependencies for better-sqlite3 and NestJS
RUN apt-get update && apt-get install -y python3 make g++ sqlite3 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --force --frozen-lockfile

# Copy all source files
COPY . .

# Build NestJS app
RUN npm run build

# Expose port (match your main.ts)
EXPOSE 4000

# Start the app
CMD ["npm", "run", "start:prod"]