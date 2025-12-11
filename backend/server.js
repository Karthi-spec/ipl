const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config()

// Import routes and middleware
const authRoutes = require('./routes/auth')
const auctionRoutes = require('./routes/auction')
const playersRoutes = require('./routes/players')
const teamsRoutes = require('./routes/teams')
const adminRoutes = require('./routes/admin')
const { authenticateToken, isAdmin } = require('./middleware/auth')
const { errorHandler } = require('./middleware/errorHandler')
const { setupDatabase } = require('./database/setup')
const SocketManager = require('./services/socketManager')
const AuctionService = require('./services/auctionService')

const app = express()
const server = createServer(app)

// Initialize database
setupDatabase()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000']

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// General middleware
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/public', express.static(path.join(__dirname, 'public')))

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
})

// Initialize services
const socketManager = new SocketManager(io)
const auctionService = new AuctionService(socketManager)

// Make services available to routes
app.locals.socketManager = socketManager
app.locals.auctionService = auctionService

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/auction', auctionRoutes)
app.use('/api/players', playersRoutes)
app.use('/api/teams', teamsRoutes)
app.use('/api/admin', authenticateToken, isAdmin, adminRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: require('./package.json').version,
    database: 'connected',
    websocket: {
      connected: socketManager.getConnectedCount(),
      rooms: socketManager.getRoomStats()
    },
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  }
  
  res.status(200).json(healthCheck)
})

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'IPL Auction Game API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Admin login',
        'POST /api/auth/logout': 'Admin logout',
        'GET /api/auth/verify': 'Verify token'
      },
      auction: {
        'GET /api/auction/state': 'Get current auction state',
        'POST /api/auction/start': 'Start auction (admin)',
        'POST /api/auction/pause': 'Pause auction (admin)',
        'POST /api/auction/reset': 'Reset auction (admin)',
        'POST /api/auction/bid': 'Place bid',
        'POST /api/auction/rtm': 'Use RTM'
      },
      players: {
        'GET /api/players': 'Get all players',
        'GET /api/players/:id': 'Get player by ID',
        'POST /api/players': 'Add player (admin)',
        'PUT /api/players/:id': 'Update player (admin)',
        'DELETE /api/players/:id': 'Delete player (admin)'
      },
      teams: {
        'GET /api/teams': 'Get all teams',
        'GET /api/teams/:id': 'Get team by ID',
        'POST /api/teams': 'Add team (admin)',
        'PUT /api/teams/:id': 'Update team (admin)'
      },
      admin: {
        'GET /api/admin/stats': 'Get auction statistics',
        'GET /api/admin/logs': 'Get system logs',
        'POST /api/admin/backup': 'Create database backup',
        'POST /api/admin/restore': 'Restore from backup'
      }
    },
    websocket: {
      events: {
        client_to_server: [
          'identify',
          'place-bid',
          'use-rtm',
          'join-room',
          'leave-room'
        ],
        server_to_client: [
          'auction-state',
          'new-bid',
          'rtm-used',
          'animation-trigger',
          'clients-update',
          'error'
        ]
      }
    }
  })
})

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../out')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../out/index.html'))
  })
}

// Error handling middleware (must be last)
app.use(errorHandler)

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err)
  // Close server & exit process
  server.close(() => {
    process.exit(1)
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    console.log('Process terminated')
  })
})

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'

server.listen(PORT, HOST, () => {
  console.log(`🚀 IPL Auction Server running on ${HOST}:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Socket.IO server ready for connections`)
  console.log(`🔒 Security: Helmet, CORS, Rate limiting enabled`)
  console.log(`📁 Static files: /uploads, /public`)
  console.log(`📖 API Documentation: http://${HOST}:${PORT}/api/docs`)
  console.log(`❤️  Health Check: http://${HOST}:${PORT}/api/health`)
})