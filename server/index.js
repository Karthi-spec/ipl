const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const path = require('path')

const app = express()
const server = createServer(app)

// Configure CORS for production - Allow all origins for global access
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? true // Allow all origins in production for global access
      : ["http://localhost:3001", "http://localhost:3000", "http://127.0.0.1:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Middleware - Allow global access
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins for global access
    : ["http://localhost:3001", "http://localhost:3000", "http://127.0.0.1:3001"],
  credentials: true
}))
app.use(express.json())
app.use(express.static('public'))

// Store room-specific auction states
let roomStates = new Map() // roomId -> auctionState
let roomClients = new Map() // roomId -> Set of socketIds
let connectedClients = new Map() // socketId -> { type, teamName, roomId, joinedAt }
let adminClients = new Map() // roomId -> Set of admin socketIds

// Default auction state template
const getDefaultAuctionState = () => ({
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
})

// Helper functions for room management
const getOrCreateRoomState = (roomId) => {
  if (!roomStates.has(roomId)) {
    roomStates.set(roomId, getDefaultAuctionState())
  }
  return roomStates.get(roomId)
}

const getOrCreateRoomClients = (roomId) => {
  if (!roomClients.has(roomId)) {
    roomClients.set(roomId, new Set())
  }
  return roomClients.get(roomId)
}

const getOrCreateRoomAdmins = (roomId) => {
  if (!adminClients.has(roomId)) {
    adminClients.set(roomId, new Set())
  }
  return adminClients.get(roomId)
}

const broadcastToRoom = (roomId, event, data) => {
  const roomClientSet = roomClients.get(roomId)
  if (roomClientSet) {
    roomClientSet.forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId)
      if (socket) {
        socket.emit(event, data)
      }
    })
  }
}

const getRoomStats = (roomId) => {
  const roomClientSet = roomClients.get(roomId) || new Set()
  const roomAdminSet = adminClients.get(roomId) || new Set()
  
  const clients = Array.from(roomClientSet).map(socketId => connectedClients.get(socketId)).filter(Boolean)
  
  return {
    total: clients.length,
    admins: roomAdminSet.size,
    teams: clients.filter(c => c.type === 'team').length,
    spectators: clients.filter(c => c.type === 'spectator').length
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  
  // Handle room joining and client identification
  socket.on('join-room', (data) => {
    const { roomId, type, teamName } = data
    
    // Store client info with room association
    connectedClients.set(socket.id, {
      type: type, // 'admin', 'team', 'spectator'
      teamName: teamName || null,
      roomId: roomId,
      joinedAt: new Date()
    })
    
    // Add client to room
    const roomClientSet = getOrCreateRoomClients(roomId)
    roomClientSet.add(socket.id)
    
    // Add to admin set if admin
    if (type === 'admin') {
      const roomAdminSet = getOrCreateRoomAdmins(roomId)
      roomAdminSet.add(socket.id)
    }
    
    // Join socket.io room for easy broadcasting
    socket.join(roomId)
    
    // Send current room state to new client
    const roomState = getOrCreateRoomState(roomId)
    socket.emit('auction-state', roomState)
    
    // Broadcast updated client count to room
    const stats = getRoomStats(roomId)
    broadcastToRoom(roomId, 'clients-update', stats)
    
    console.log(`Client ${socket.id} joined room ${roomId} as ${type}`)
  })
  
  // Handle client identification (legacy support)
  socket.on('identify', (data) => {
    // This is for backward compatibility - clients should use join-room instead
    console.log('Legacy identify event received, client should use join-room')
  })
  
  // Handle auction state updates (admin only)
  socket.on('update-auction-state', (newState) => {
    const client = connectedClients.get(socket.id)
    if (client && client.type === 'admin' && client.roomId) {
      const roomState = getOrCreateRoomState(client.roomId)
      const updatedState = { ...roomState, ...newState }
      roomStates.set(client.roomId, updatedState)
      
      // Broadcast to room clients only
      broadcastToRoom(client.roomId, 'auction-state', updatedState)
    }
  })
  
  // Handle animation triggers (admin only)
  socket.on('trigger-animation', (animationData) => {
    const client = connectedClients.get(socket.id)
    if (client && client.type === 'admin' && client.roomId) {
      const roomState = getOrCreateRoomState(client.roomId)
      roomState.animations = { ...roomState.animations, ...animationData }
      
      // Broadcast animation to room clients only
      broadcastToRoom(client.roomId, 'animation-trigger', animationData)
    }
  })
  
  // Handle bids (team clients only)
  socket.on('place-bid', (bidData) => {
    const client = connectedClients.get(socket.id)
    if (client && client.type === 'team' && client.teamName === bidData.teamName && client.roomId) {
      const roomState = getOrCreateRoomState(client.roomId)
      
      // Validate bid and add to state
      const newBid = {
        id: Date.now().toString(),
        ...bidData,
        timestamp: Date.now(),
        socketId: socket.id
      }
      
      roomState.bids.unshift(newBid)
      roomState.currentPlayer = {
        ...roomState.currentPlayer,
        currentBid: bidData.amount,
        currentBidder: bidData.teamName
      }
      
      // Broadcast updated state to room only
      broadcastToRoom(client.roomId, 'auction-state', roomState)
      broadcastToRoom(client.roomId, 'new-bid', newBid)
    }
  })
  
  // Handle RTM usage
  socket.on('use-rtm', (rtmData) => {
    const client = connectedClients.get(socket.id)
    if (client && client.type === 'team' && client.teamName === rtmData.teamName && client.roomId) {
      // Broadcast RTM usage to room only
      broadcastToRoom(client.roomId, 'rtm-used', rtmData)
    }
  })

  // Handle team analysis broadcast (admin only)
  socket.on('broadcast-team-analysis', (analysisData) => {
    const client = connectedClients.get(socket.id)
    if (client && client.type === 'admin' && client.roomId) {
      // Broadcast team analysis to room clients only
      broadcastToRoom(client.roomId, 'show-team-analysis', analysisData)
      console.log(`Team analysis broadcasted to room ${client.roomId}`)
    }
  })

  // Handle room termination (admin only)
  socket.on('end-room', (roomData) => {
    const client = connectedClients.get(socket.id)
    if (client && client.type === 'admin' && client.roomId === roomData.roomId) {
      console.log(`Admin ${socket.id} is ending room: ${roomData.roomId}`)
      
      // Broadcast room termination to room clients only
      broadcastToRoom(roomData.roomId, 'room-ended', {
        roomId: roomData.roomId,
        message: 'The room has been terminated by the admin'
      })
      
      // Clean up room data
      const roomClientSet = roomClients.get(roomData.roomId)
      if (roomClientSet) {
        // Remove all clients from this room
        roomClientSet.forEach(socketId => {
          const clientSocket = io.sockets.sockets.get(socketId)
          if (clientSocket) {
            clientSocket.leave(roomData.roomId)
          }
          connectedClients.delete(socketId)
        })
      }
      
      // Remove room from all maps
      roomStates.delete(roomData.roomId)
      roomClients.delete(roomData.roomId)
      adminClients.delete(roomData.roomId)
      
      console.log(`Room ${roomData.roomId} ended and cleaned up`)
    }
  })
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    
    const client = connectedClients.get(socket.id)
    if (client && client.roomId) {
      // Remove from room clients
      const roomClientSet = roomClients.get(client.roomId)
      if (roomClientSet) {
        roomClientSet.delete(socket.id)
      }
      
      // Remove from admin set if admin
      if (client.type === 'admin') {
        const roomAdminSet = adminClients.get(client.roomId)
        if (roomAdminSet) {
          roomAdminSet.delete(socket.id)
        }
      }
      
      // Broadcast updated client count to room
      const stats = getRoomStats(client.roomId)
      broadcastToRoom(client.roomId, 'clients-update', stats)
      
      // Clean up empty rooms
      if (roomClientSet && roomClientSet.size === 0) {
        console.log(`Room ${client.roomId} is empty, cleaning up`)
        roomStates.delete(client.roomId)
        roomClients.delete(client.roomId)
        adminClients.delete(client.roomId)
      }
    }
    
    connectedClients.delete(socket.id)
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

app.get('/api/auction-state/:roomId', (req, res) => {
  const { roomId } = req.params
  const roomState = roomStates.get(roomId) || getDefaultAuctionState()
  res.json(roomState)
})

app.get('/api/room-stats/:roomId', (req, res) => {
  const { roomId } = req.params
  const stats = getRoomStats(roomId)
  res.json(stats)
})

app.post('/api/reset-auction/:roomId', (req, res) => {
  // Reset auction state for specific room (admin only - add authentication in production)
  const { roomId } = req.params
  const defaultState = getDefaultAuctionState()
  roomStates.set(roomId, defaultState)
  
  broadcastToRoom(roomId, 'auction-state', defaultState)
  res.json({ success: true, message: `Auction reset successfully for room ${roomId}` })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../out')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../out/index.html'))
  })
}

const PORT = process.env.PORT || 3002

server.listen(PORT, () => {
  console.log(`🚀 IPL Auction Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Socket.IO server ready for connections`)
})