const { getDatabase } = require('../database/setup')

class SocketManager {
  constructor(io) {
    this.io = io
    this.connectedClients = new Map()
    this.adminClients = new Set()
    this.teamRooms = new Map()
    this.db = getDatabase()
    
    this.setupSocketHandlers()
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`)
      
      // Log connection to database
      this.logConnection(socket)
      
      // Handle client identification
      socket.on('identify', (data) => {
        this.handleClientIdentification(socket, data)
      })
      
      // Handle joining rooms
      socket.on('join-room', (roomName) => {
        socket.join(roomName)
        console.log(`📍 Client ${socket.id} joined room: ${roomName}`)
      })
      
      // Handle leaving rooms
      socket.on('leave-room', (roomName) => {
        socket.leave(roomName)
        console.log(`📍 Client ${socket.id} left room: ${roomName}`)
      })
      
      // Handle auction state updates (admin only)
      socket.on('update-auction-state', (newState) => {
        this.handleAuctionStateUpdate(socket, newState)
      })
      
      // Handle animation triggers (admin only)
      socket.on('trigger-animation', (animationData) => {
        this.handleAnimationTrigger(socket, animationData)
      })
      
      // Handle bids (team clients only)
      socket.on('place-bid', (bidData) => {
        this.handleBidPlacement(socket, bidData)
      })
      
      // Handle RTM usage
      socket.on('use-rtm', (rtmData) => {
        this.handleRTMUsage(socket, rtmData)
      })

      // Handle team analysis broadcast (admin only)
      socket.on('broadcast-team-analysis', (analysisData) => {
        this.handleTeamAnalysisBroadcast(socket, analysisData)
      })
      
      // Handle heartbeat for connection monitoring
      socket.on('heartbeat', () => {
        this.updateLastActivity(socket.id)
      })
      
      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason)
      })
    })
  }

  logConnection(socket) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO connected_clients (socket_id, client_type, ip_address, user_agent)
        VALUES (?, ?, ?, ?)
      `)
      
      stmt.run(
        socket.id,
        'unknown',
        socket.handshake.address,
        socket.handshake.headers['user-agent'] || 'Unknown'
      )
    } catch (error) {
      console.error('Error logging connection:', error)
    }
  }

  handleClientIdentification(socket, data) {
    try {
      // Validate identification data
      if (!data.type || !['admin', 'team', 'spectator'].includes(data.type)) {
        socket.emit('error', { message: 'Invalid client type' })
        return
      }

      // Store client information
      this.connectedClients.set(socket.id, {
        type: data.type,
        teamName: data.teamName || null,
        joinedAt: new Date(),
        lastActivity: new Date()
      })
      
      // Handle admin clients
      if (data.type === 'admin') {
        this.adminClients.add(socket.id)
        socket.join('admin-room')
      }
      
      // Handle team clients
      if (data.type === 'team' && data.teamName) {
        const roomName = `team-${data.teamName.replace(/\s+/g, '-').toLowerCase()}`
        socket.join(roomName)
        
        if (!this.teamRooms.has(data.teamName)) {
          this.teamRooms.set(data.teamName, new Set())
        }
        this.teamRooms.get(data.teamName).add(socket.id)
      }
      
      // Update database
      const stmt = this.db.prepare(`
        UPDATE connected_clients 
        SET client_type = ?, team_name = ?, last_activity = CURRENT_TIMESTAMP
        WHERE socket_id = ?
      `)
      stmt.run(data.type, data.teamName || null, socket.id)
      
      // Broadcast updated client statistics
      this.broadcastClientStats()
      
      console.log(`👤 Client identified: ${socket.id} as ${data.type}${data.teamName ? ` (${data.teamName})` : ''}`)
      
    } catch (error) {
      console.error('Error handling client identification:', error)
      socket.emit('error', { message: 'Identification failed' })
    }
  }

  handleAuctionStateUpdate(socket, newState) {
    const client = this.connectedClients.get(socket.id)
    if (!client || client.type !== 'admin') {
      socket.emit('error', { message: 'Unauthorized: Admin access required' })
      return
    }

    try {
      // Broadcast to all clients
      this.io.emit('auction-state', newState)
      
      // Log the action
      this.logAuctionAction(socket.id, 'state-update', newState)
      
    } catch (error) {
      console.error('Error handling auction state update:', error)
      socket.emit('error', { message: 'Failed to update auction state' })
    }
  }

  handleAnimationTrigger(socket, animationData) {
    const client = this.connectedClients.get(socket.id)
    if (!client || client.type !== 'admin') {
      socket.emit('error', { message: 'Unauthorized: Admin access required' })
      return
    }

    try {
      // Broadcast animation to all clients
      this.io.emit('animation-trigger', animationData)
      
      // Log the action
      this.logAuctionAction(socket.id, 'animation-trigger', animationData)
      
    } catch (error) {
      console.error('Error handling animation trigger:', error)
      socket.emit('error', { message: 'Failed to trigger animation' })
    }
  }

  handleBidPlacement(socket, bidData) {
    const client = this.connectedClients.get(socket.id)
    if (!client || client.type !== 'team') {
      socket.emit('error', { message: 'Unauthorized: Team access required' })
      return
    }

    if (client.teamName !== bidData.teamName) {
      socket.emit('error', { message: 'Unauthorized: Can only bid for your own team' })
      return
    }

    try {
      // Validate bid data
      if (!bidData.playerId || !bidData.amount || bidData.amount <= 0) {
        socket.emit('error', { message: 'Invalid bid data' })
        return
      }

      // Create bid record
      const newBid = {
        id: Date.now().toString(),
        playerId: bidData.playerId,
        playerName: bidData.playerName,
        teamName: bidData.teamName,
        amount: bidData.amount,
        timestamp: Date.now(),
        socketId: socket.id
      }

      // Store bid in database
      const stmt = this.db.prepare(`
        INSERT INTO bids (player_id, team_id, amount, socket_id)
        VALUES (?, (SELECT id FROM teams WHERE name = ?), ?, ?)
      `)
      stmt.run(bidData.playerId, bidData.teamName, bidData.amount, socket.id)

      // Broadcast to all clients
      this.io.emit('new-bid', newBid)
      
      // Log the action
      this.logAuctionAction(socket.id, 'bid-placed', newBid)
      
      console.log(`💰 Bid placed: ${bidData.teamName} - ₹${bidData.amount}Cr for ${bidData.playerName}`)
      
    } catch (error) {
      console.error('Error handling bid placement:', error)
      socket.emit('error', { message: 'Failed to place bid' })
    }
  }

  handleRTMUsage(socket, rtmData) {
    const client = this.connectedClients.get(socket.id)
    if (!client || client.type !== 'team') {
      socket.emit('error', { message: 'Unauthorized: Team access required' })
      return
    }

    if (client.teamName !== rtmData.teamName) {
      socket.emit('error', { message: 'Unauthorized: Can only use RTM for your own team' })
      return
    }

    try {
      // Broadcast RTM usage to all clients
      this.io.emit('rtm-used', rtmData)
      
      // Log the action
      this.logAuctionAction(socket.id, 'rtm-used', rtmData)
      
      console.log(`🎯 RTM used: ${rtmData.teamName} for ${rtmData.playerName}`)
      
    } catch (error) {
      console.error('Error handling RTM usage:', error)
      socket.emit('error', { message: 'Failed to use RTM' })
    }
  }

  handleTeamAnalysisBroadcast(socket, analysisData) {
    const client = this.connectedClients.get(socket.id)
    if (!client || client.type !== 'admin') {
      socket.emit('error', { message: 'Unauthorized: Admin access required' })
      return
    }

    try {
      // Broadcast team analysis to all connected clients
      this.io.emit('show-team-analysis', analysisData)
      
      // Log the action
      this.logAuctionAction(socket.id, 'team-analysis-broadcast', { count: analysisData.length })
      
      console.log('📊 Team analysis broadcasted to all clients')
      
    } catch (error) {
      console.error('Error handling team analysis broadcast:', error)
      socket.emit('error', { message: 'Failed to broadcast team analysis' })
    }
  }

  handleDisconnection(socket, reason) {
    console.log(`🔌 Client disconnected: ${socket.id} (${reason})`)
    
    try {
      const client = this.connectedClients.get(socket.id)
      
      // Remove from admin clients if applicable
      if (client && client.type === 'admin') {
        this.adminClients.delete(socket.id)
      }
      
      // Remove from team rooms if applicable
      if (client && client.type === 'team' && client.teamName) {
        const teamClients = this.teamRooms.get(client.teamName)
        if (teamClients) {
          teamClients.delete(socket.id)
          if (teamClients.size === 0) {
            this.teamRooms.delete(client.teamName)
          }
        }
      }
      
      // Remove from connected clients
      this.connectedClients.delete(socket.id)
      
      // Remove from database
      const stmt = this.db.prepare('DELETE FROM connected_clients WHERE socket_id = ?')
      stmt.run(socket.id)
      
      // Broadcast updated client statistics
      this.broadcastClientStats()
      
    } catch (error) {
      console.error('Error handling disconnection:', error)
    }
  }

  updateLastActivity(socketId) {
    try {
      const client = this.connectedClients.get(socketId)
      if (client) {
        client.lastActivity = new Date()
      }
      
      const stmt = this.db.prepare(`
        UPDATE connected_clients 
        SET last_activity = CURRENT_TIMESTAMP 
        WHERE socket_id = ?
      `)
      stmt.run(socketId)
    } catch (error) {
      console.error('Error updating last activity:', error)
    }
  }

  broadcastClientStats() {
    const stats = {
      total: this.connectedClients.size,
      admins: this.adminClients.size,
      teams: Array.from(this.connectedClients.values()).filter(c => c.type === 'team').length,
      spectators: Array.from(this.connectedClients.values()).filter(c => c.type === 'spectator').length,
      teamRooms: Object.fromEntries(
        Array.from(this.teamRooms.entries()).map(([team, clients]) => [team, clients.size])
      )
    }
    
    this.io.emit('clients-update', stats)
  }

  logAuctionAction(socketId, action, details) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO auction_logs (action, details, timestamp)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `)
      stmt.run(action, JSON.stringify(details))
    } catch (error) {
      console.error('Error logging auction action:', error)
    }
  }

  // Public methods for external use
  getConnectedCount() {
    return this.connectedClients.size
  }

  getRoomStats() {
    return {
      total: this.connectedClients.size,
      admins: this.adminClients.size,
      teams: this.teamRooms.size,
      spectators: Array.from(this.connectedClients.values()).filter(c => c.type === 'spectator').length
    }
  }

  broadcastToAdmins(event, data) {
    this.io.to('admin-room').emit(event, data)
  }

  broadcastToTeam(teamName, event, data) {
    const roomName = `team-${teamName.replace(/\s+/g, '-').toLowerCase()}`
    this.io.to(roomName).emit(event, data)
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data)
  }
}

module.exports = SocketManager