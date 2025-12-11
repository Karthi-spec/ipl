# IPL Auction Game - Production Deployment Guide

## 🚀 Complete Production-Ready Backend API Server

This guide provides step-by-step instructions for deploying the IPL Auction Game as a professional, production-ready web application with a robust backend API server.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Backend Architecture](#backend-architecture)
4. [Database Setup](#database-setup)
5. [API Documentation](#api-documentation)
6. [Security Features](#security-features)
7. [Deployment Options](#deployment-options)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

## 🖥️ System Requirements

### Minimum Requirements
- **OS**: Linux (Ubuntu 20.04+), macOS, or Windows 10+
- **Node.js**: 18.0.0 or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 10GB free space
- **Network**: Stable internet connection

### Recommended for Production
- **OS**: Ubuntu 22.04 LTS or CentOS 8+
- **CPU**: 2+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Network**: 100Mbps+ bandwidth

## ⚡ Quick Start

### Option 1: Docker Deployment (Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd ipl-auction-game

# 2. Navigate to backend
cd backend

# 3. Copy environment file
cp .env.example .env

# 4. Edit configuration (IMPORTANT!)
nano .env

# 5. Deploy with Docker
chmod +x deploy.sh
./deploy.sh --seed

# 6. Access the application
# API: http://localhost:3001
# Health: http://localhost:3001/api/health
# Docs: http://localhost:3001/api/docs
```

### Option 2: Manual Installation

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your settings

# 3. Setup database
npm run migrate
npm run seed

# 4. Start the server
npm start

# Production mode
NODE_ENV=production npm start
```

## 🏗️ Backend Architecture

### Core Components

```
backend/
├── server.js              # Main application server
├── database/
│   └── setup.js           # Database initialization
├── routes/
│   ├── auth.js            # Authentication endpoints
│   ├── auction.js         # Auction management
│   ├── players.js         # Player management
│   ├── teams.js           # Team management
│   └── admin.js           # Admin operations
├── services/
│   ├── socketManager.js   # WebSocket management
│   └── auctionService.js  # Business logic
├── middleware/
│   ├── auth.js            # JWT authentication
│   └── errorHandler.js    # Global error handling
└── scripts/
    ├── migrate.js         # Database migrations
    └── seed.js            # Data seeding
```

### Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite (Better-SQLite3)
- **WebSocket**: Socket.IO
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus + Grafana (optional)

## 🗄️ Database Setup

### Automatic Setup
The database is automatically created and configured when you run:
```bash
npm run migrate
npm run seed
```

### Manual Database Operations

```bash
# Create backup
curl -X POST http://localhost:3001/api/admin/backup \
  -H "Authorization: Bearer <admin-token>"

# View database stats
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer <admin-token>"

# Clear old logs
curl -X DELETE "http://localhost:3001/api/admin/logs?days=7" \
  -H "Authorization: Bearer <admin-token>"
```

### Database Schema

```sql
-- Core tables
users              # Admin authentication
teams              # IPL teams
players            # Player database
bids               # Bidding history
auction_sessions   # Auction management
auction_logs       # System logs
connected_clients  # Real-time monitoring
system_settings    # Configuration
```

## 📚 API Documentation

### Authentication Endpoints

```bash
# Admin login
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}

# Verify token
GET /api/auth/verify
Authorization: Bearer <token>

# Change password
POST /api/auth/change-password
Authorization: Bearer <token>
{
  "currentPassword": "old",
  "newPassword": "new"
}
```

### Auction Management

```bash
# Get auction state
GET /api/auction/state

# Start auction (admin)
POST /api/auction/start
Authorization: Bearer <token>

# Place bid
POST /api/auction/bid
{
  "playerId": 1,
  "teamName": "Mumbai Indians",
  "amount": 5.5
}

# Sell player (admin)
POST /api/auction/sell
Authorization: Bearer <token>
{
  "playerId": 1,
  "teamName": "Mumbai Indians",
  "amount": 5.5
}
```

### Player Management

```bash
# Get all players
GET /api/players

# Get player by ID
GET /api/players/1

# Add player (admin)
POST /api/players
Authorization: Bearer <token>
{
  "name": "New Player",
  "role": "Batsman",
  "country": "India",
  "basePrice": 2.0
}

# Update player (admin)
PUT /api/players/1
Authorization: Bearer <token>
{
  "basePrice": 2.5
}
```

### Team Management

```bash
# Get all teams
GET /api/teams

# Get team with players
GET /api/teams/1/players

# Get team statistics
GET /api/teams/1/stats
```

### Admin Operations

```bash
# System statistics
GET /api/admin/stats
Authorization: Bearer <token>

# System logs
GET /api/admin/logs?limit=100&offset=0
Authorization: Bearer <token>

# Create backup
POST /api/admin/backup
Authorization: Bearer <token>

# Health check
GET /api/admin/health
Authorization: Bearer <token>
```

## 🔒 Security Features

### Built-in Security

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with 12 rounds
- **Rate Limiting**: API and auth endpoint protection
- **CORS Protection**: Configurable origins
- **Helmet Security**: HTTP security headers
- **Input Validation**: Express-validator
- **SQL Injection Protection**: Prepared statements
- **XSS Protection**: Content Security Policy

### Configuration

```env
# Security settings in .env
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_PASSWORD=secure-admin-password
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 🚀 Deployment Options

### 1. Docker Deployment (Recommended)

```bash
# Single container
docker run -d \
  --name ipl-auction-backend \
  -p 3001:3001 \
  -v auction_db:/app/database \
  -e NODE_ENV=production \
  ipl-auction-backend:latest

# Docker Compose (Full stack)
docker-compose up -d
```

### 2. Cloud Deployment

#### AWS EC2
```bash
# Launch EC2 instance (t3.medium recommended)
# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Deploy application
git clone <repo>
cd ipl-auction-game/backend
./deploy.sh --seed
```

#### Google Cloud Platform
```bash
# Create VM instance
gcloud compute instances create ipl-auction-vm \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --machine-type=e2-medium \
  --zone=us-central1-a

# SSH and deploy
gcloud compute ssh ipl-auction-vm
# Follow Docker deployment steps
```

#### DigitalOcean Droplet
```bash
# Create droplet with Docker pre-installed
# SSH to droplet
ssh root@your-droplet-ip

# Deploy
git clone <repo>
cd ipl-auction-game/backend
./deploy.sh --seed
```

### 3. VPS Deployment

```bash
# For Ubuntu/Debian VPS
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose nodejs npm

# Clone and deploy
git clone <repo>
cd ipl-auction-game/backend
sudo ./deploy.sh --seed
```

### 4. Heroku Deployment

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create ipl-auction-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set ADMIN_PASSWORD=your-password

# Deploy
git push heroku main
```

## 📊 Monitoring & Logging

### Built-in Monitoring

```bash
# Health check endpoint
curl http://localhost:3001/api/health

# System statistics
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer <token>"

# Real-time logs
docker-compose logs -f auction-backend
```

### Optional: Prometheus + Grafana

```bash
# Enable monitoring stack
docker-compose --profile monitoring up -d

# Access Grafana
# URL: http://localhost:3000
# Username: admin
# Password: admin123 (or from env)
```

### Log Management

```bash
# View application logs
docker-compose logs auction-backend

# View Nginx logs
docker-compose logs nginx

# Clear old logs via API
curl -X DELETE "http://localhost:3001/api/admin/logs?days=7" \
  -H "Authorization: Bearer <token>"
```

## 💾 Backup & Recovery

### Automated Backups

```bash
# Create backup via API
curl -X POST http://localhost:3001/api/admin/backup \
  -H "Authorization: Bearer <token>"

# List backups
curl http://localhost:3001/api/admin/backups \
  -H "Authorization: Bearer <token>"

# Download backup
curl http://localhost:3001/api/admin/backup/filename.db \
  -H "Authorization: Bearer <token>" \
  -o backup.db
```

### Manual Backup

```bash
# Database backup
cp backend/database/auction.db backup-$(date +%Y%m%d).db

# Full application backup
tar -czf ipl-auction-backup-$(date +%Y%m%d).tar.gz \
  backend/database \
  backend/uploads \
  backend/logs \
  backend/.env
```

### Recovery

```bash
# Restore database
cp backup-20241211.db backend/database/auction.db

# Restart application
docker-compose restart auction-backend
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001
# Kill process
kill -9 <PID>
```

#### 2. Database Connection Error
```bash
# Check database file permissions
ls -la backend/database/
# Fix permissions
chmod 644 backend/database/auction.db
```

#### 3. Docker Issues
```bash
# Clean Docker system
docker system prune -a
# Rebuild image
docker-compose build --no-cache
```

#### 4. Memory Issues
```bash
# Check memory usage
free -h
# Restart with memory limit
docker run --memory=1g ipl-auction-backend
```

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development npm start

# Docker debug
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up
```

### Performance Optimization

```bash
# Enable production optimizations
NODE_ENV=production
# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name ipl-auction
```

## 🌐 Domain & SSL Setup

### Domain Configuration

```bash
# Update DNS records
# A record: yourdomain.com -> your-server-ip
# CNAME: www.yourdomain.com -> yourdomain.com
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📞 Support & Maintenance

### Regular Maintenance

```bash
# Weekly tasks
- Check system health: curl /api/health
- Review logs: docker-compose logs
- Create backup: curl -X POST /api/admin/backup
- Update dependencies: npm audit fix

# Monthly tasks
- Clear old logs: curl -X DELETE /api/admin/logs?days=30
- Review security: npm audit
- Update system: sudo apt update && sudo apt upgrade
```

### Performance Monitoring

```bash
# Monitor resource usage
docker stats

# Check application metrics
curl http://localhost:3001/api/admin/stats

# Database performance
sqlite3 database/auction.db ".schema"
```

## 🎉 Success!

Your IPL Auction Game is now running as a professional, production-ready web application with:

✅ **Robust Backend API** - Complete REST API with authentication  
✅ **Real-time WebSocket** - Live bidding and updates  
✅ **Secure Database** - SQLite with proper schema and backups  
✅ **Production Security** - JWT, rate limiting, CORS, validation  
✅ **Docker Containerization** - Easy deployment and scaling  
✅ **Monitoring & Logging** - Health checks and system metrics  
✅ **Backup & Recovery** - Automated database backups  
✅ **Documentation** - Complete API documentation  

### Next Steps

1. **Configure your domain** and SSL certificates
2. **Set up monitoring** with Prometheus/Grafana
3. **Configure backups** to cloud storage
4. **Set up CI/CD** for automated deployments
5. **Scale horizontally** with load balancers if needed

### Support

For issues or questions:
- Check the troubleshooting section
- Review application logs
- Check API documentation at `/api/docs`
- Monitor system health at `/api/health`

**Happy Auctioning! 🏏🎯**