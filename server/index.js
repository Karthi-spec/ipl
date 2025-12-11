const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const path = require('path')

const app = express()
const server = createServer(app)

// Configure CORS for production
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://your-domain.com", "https://www.your-domain.com"]
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://your-domain.com", "https://www.your-domain.com"]
    : ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}))
app.use(express.json())
app.use(express.static('public'))

// Store auction state
let auctionState = {
  currentPlayer: null,
  teams: [],
  players: [],
  bids: [],
  isAuctionActive: false,
  timer: 30,
  animations: {
    showSoldAnimation: false,
    showRTMAnimation: false,
    showRetainedAnimation: false,
    showUnsoldAnimation: false,
    soldAnimationData: null,
    rtmAnimationData: null,
    retainedAnimationData: null,
    unsoldAnimationData: null
  }
}

// Connected clients
let connectedClients = new Map()
let adminClients = new Set()

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  
  // Send current state to new client
  socket.emit('auction-state', auctionState)
  
  // Handle client identification
  socket.on('identify', (data) => {
    connectedClients.set(socket.id, {
      type: data.type, // 'admin', 'team', 'spectator'
      teamName: data.teamName || null,
      joinedAt: new Date()
    })
    
    if (data.type === 'admin') {
      adminClients.add(socket.id)
    }
    
    // Broadcast updated client count
    io.emit('clients-update', {
      total: connectedClients.size,
      admins: adminClients.size,
      teams: Array.from(connectedClients.values()).filter(c => c.type === 'team').length,
      spectators: Array.from(connectedClients.values()).filter(c => c.type === 'spectator').length
    })
  })
  
  // Handle auction state updates (admin only)
  socket.on('update-auction-state', (newState) => {
    const client = connectedClients.get(socket.id)
    if (client && client.type === 'admin') {
      auctionState = { ...auctionState, ...newState }
      // Broadcast to all clients
      io.emit('auction-state', auctionState)
    }
  })
  
  // Handle animation triggers (admin only)
  socket.on('trigger-animation', (animationData) => {
    const client = connectedClients.get(socket.id)
    if (client && client.type === 'admin') {
      auctionState.animations = { ...auctionState.animations, ...animationData }
      // Broadcast animation to all clients
      io.emit('animation-trigger', animationData)
    }
  })
  
  // Handle bids (team clients only)
  socket.on('place-bid', (bidData) => {
    const client = connectedClients.get(socket.id)
    if (client && client.type === 'team' && client.teamName === bidData.teamName) {
      // Validate bid and add to state
      const newBid = {
        id: Date.now().toString(),
        ...bidData,
        timestamp: Date.now(),
        socketId: socket.id
      }
      
      auctionState.bids.unshift(newBid)
      auctionState.currentPlayer = {
        ...auctionState.currentPlayer,
        currentBid: bidData.amount,
        currentBidder: bidData.teamName
      }
      
      // Broadcast updated state
      io.emit('auction-state', auctionState)
      io.emit('new-bid', newBid)
    }
  })
  
  // Handle RTM usage
  socket.on('use-rtm', (rtmData) => {
    const client = connectedClients.get(socket.id)
    if (client && client.type === 'team' && client.teamName === rtmData.teamName) {
      // Broadcast RTM usage
      io.emit('rtm-used', rtmData)
    }
  })

  // Handle team analysis broadcast (admin only)
  socket.on('broadcast-team-analysis', (analysisData) => {
    const client = connectedClients.get(socket.id)
    if (client && client.type === 'admin') {
      // Broadcast team analysis to all connected clients
      io.emit('show-team-analysis', analysisData)
      console.log('Team analysis broadcasted to all clients')
    }
  })
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    
    const client = connectedClients.get(socket.id)
    if (client && client.type === 'admin') {
      adminClients.delete(socket.id)
    }
    
    connectedClients.delete(socket.id)
    
    // Broadcast updated client count
    io.emit('clients-update', {
      total: connectedClients.size,
      admins: adminClients.size,
      teams: Array.from(connectedClients.values()).filter(c => c.type === 'team').length,
      spectators: Array.from(connectedClients.values()).filter(c => c.type === 'spectator').length
    })
  })
})

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    clients: connectedClients.size,
    uptime: process.uptime()
  })
})

app.get('/api/auction-state', (req, res) => {
  res.json(auctionState)
})

app.post('/api/reset-auction', (req, res) => {
  // Reset auction state (admin only - add authentication in production)
  auctionState = {
    currentPlayer: null,
    teams: [],
    players: [],
    bids: [],
    isAuctionActive: false,
    timer: 30,
    animations: {
      showSoldAnimation: false,
      showRTMAnimation: false,
      showRetainedAnimation: false,
      showUnsoldAnimation: false,
      soldAnimationData: null,
      rtmAnimationData: null,
      retainedAnimationData: null,
      unsoldAnimationData: null
    }
  }
  
  io.emit('auction-state', auctionState)
  res.json({ success: true, message: 'Auction reset successfully' })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../out')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../out/index.html'))
  })
}

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 IPL Auction Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Socket.IO server ready for connections`)
})