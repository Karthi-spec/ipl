#!/bin/bash

# IPL Auction Backend Deployment Script
set -e

echo "🚀 Starting IPL Auction Backend Deployment..."

# Configuration
APP_NAME="ipl-auction-backend"
DOCKER_IMAGE="$APP_NAME:latest"
CONTAINER_NAME="$APP_NAME"
NETWORK_NAME="auction-network"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    log_info "Creating .env file from template..."
    cp .env.example .env
    log_warning "Please edit .env file with your configuration before running again."
    exit 1
fi

# Load environment variables
source .env

# Create necessary directories
log_info "Creating necessary directories..."
mkdir -p database uploads logs backups public ssl

# Set permissions
chmod 755 database uploads logs backups public
chmod 600 .env

# Build Docker image
log_info "Building Docker image..."
docker build -t $DOCKER_IMAGE .

# Stop existing container if running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    log_info "Stopping existing container..."
    docker stop $CONTAINER_NAME
fi

# Remove existing container
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    log_info "Removing existing container..."
    docker rm $CONTAINER_NAME
fi

# Create Docker network if it doesn't exist
if ! docker network ls | grep -q $NETWORK_NAME; then
    log_info "Creating Docker network..."
    docker network create $NETWORK_NAME
fi

# Run database migrations
log_info "Running database migrations..."
docker run --rm \
    -v "$(pwd)/database:/app/database" \
    -v "$(pwd)/.env:/app/.env" \
    $DOCKER_IMAGE npm run migrate

# Seed database if requested
if [ "$1" = "--seed" ]; then
    log_info "Seeding database..."
    docker run --rm \
        -v "$(pwd)/database:/app/database" \
        -v "$(pwd)/.env:/app/.env" \
        -v "$(pwd)/../players.json:/app/players.json" \
        -v "$(pwd)/../data:/app/data" \
        $DOCKER_IMAGE npm run seed
fi

# Start the application with Docker Compose
log_info "Starting application with Docker Compose..."
docker-compose up -d

# Wait for application to start
log_info "Waiting for application to start..."
sleep 10

# Health check
log_info "Performing health check..."
for i in {1..30}; do
    if curl -f http://localhost:${PORT:-3001}/api/health > /dev/null 2>&1; then
        log_success "Application is healthy!"
        break
    fi
    
    if [ $i -eq 30 ]; then
        log_error "Health check failed after 30 attempts"
        docker-compose logs auction-backend
        exit 1
    fi
    
    sleep 2
done

# Display status
log_success "Deployment completed successfully!"
echo ""
echo "📊 Application Status:"
echo "🌐 API Server: http://localhost:${PORT:-3001}"
echo "❤️  Health Check: http://localhost:${PORT:-3001}/api/health"
echo "📖 API Documentation: http://localhost:${PORT:-3001}/api/docs"
echo "🔐 Admin Login: POST /api/auth/login (username: admin, password: ${ADMIN_PASSWORD:-admin123})"
echo ""
echo "📋 Useful Commands:"
echo "  View logs: docker-compose logs -f auction-backend"
echo "  Stop app: docker-compose down"
echo "  Restart: docker-compose restart auction-backend"
echo "  Backup DB: curl -X POST http://localhost:${PORT:-3001}/api/admin/backup -H 'Authorization: Bearer <token>'"
echo ""

# Show running containers
log_info "Running containers:"
docker-compose ps

log_success "🎉 IPL Auction Backend is now running!"