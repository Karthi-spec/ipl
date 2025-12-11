const { getDatabase } = require('../database/setup')

class AuctionService {
  constructor(socketManager) {
    this.socketManager = socketManager
    this.dbHelpers = getDatabase()
    this.currentSession = null
    this.auctionState = this.initializeAuctionState()
  }

  initializeAuctionState() {
    return {
      currentPlayer: null,
      teams: this.getAllTeams(),
      players: this.getAllPlayers(),
      bids: [],
      isAuctionActive: false,
      timer: 30,
      timerLimit: 30,
      isTimerRunning: false,
      isTimerPaused: false,
      retentionPhaseActive: false,
      retentionPhaseComplete: false,
      maxRetentions: 6,
      maxRTM: 1,
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
  }

  // Team management
  getAllTeams() {
    try {
      return this.dbHelpers.findAll('teams').sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Error fetching teams:', error)
      return []
    }
  }

  getTeamById(id) {
    try {
      return this.dbHelpers.findOne('teams', { id: parseInt(id) })
    } catch (error) {
      console.error('Error fetching team:', error)
      return null
    }
  }

  getTeamByName(name) {
    try {
      return this.dbHelpers.findOne('teams', { name })
    } catch (error) {
      console.error('Error fetching team by name:', error)
      return null
    }
  }

  updateTeam(id, teamData) {
    try {
      const updated = this.dbHelpers.update('teams', { id: parseInt(id) }, {
        name: teamData.name,
        budget: teamData.budget,
        color: teamData.color,
        logo: teamData.logo,
        rtm_available: teamData.rtmAvailable,
        retentions_used: teamData.retentionsUsed
      })
      
      if (updated) {
        this.auctionState.teams = this.getAllTeams()
        this.socketManager.broadcastToAll('auction-state', this.auctionState)
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating team:', error)
      return false
    }
  }

  // Player management
  getAllPlayers() {
    try {
      const players = this.dbHelpers.findAll('players')
      const teams = this.dbHelpers.findAll('teams')
      
      return players
        .map(player => {
          const team = teams.find(t => t.id === player.team_id)
          return {
            ...player,
            team_name: team ? team.name : null,
            stats: player.stats ? JSON.parse(player.stats) : {}
          }
        })
        .sort((a, b) => {
          if (a.category_order !== b.category_order) {
            return a.category_order - b.category_order
          }
          return a.name.localeCompare(b.name)
        })
    } catch (error) {
      console.error('Error fetching players:', error)
      return []
    }
  }

  getPlayerById(id) {
    try {
      const player = this.dbHelpers.findOne('players', { id: parseInt(id) })
      if (player) {
        const team = this.dbHelpers.findOne('teams', { id: player.team_id })
        return {
          ...player,
          team_name: team ? team.name : null,
          stats: player.stats ? JSON.parse(player.stats) : {}
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching player:', error)
      return null
    }
  }

  addPlayer(playerData) {
    try {
      const newPlayer = this.dbHelpers.insert('players', {
        name: playerData.name,
        role: playerData.role,
        country: playerData.country,
        base_price: playerData.basePrice,
        current_bid: playerData.basePrice,
        status: 'available',
        set_category: playerData.setCategory,
        category_order: playerData.categoryOrder || 99,
        stats: JSON.stringify(playerData.stats || {})
      })
      
      if (newPlayer) {
        this.auctionState.players = this.getAllPlayers()
        this.socketManager.broadcastToAll('auction-state', this.auctionState)
        return newPlayer.id
      }
      return null
    } catch (error) {
      console.error('Error adding player:', error)
      return null
    }
  }

  updatePlayer(id, playerData) {
    try {
      const updated = this.dbHelpers.update('players', { id: parseInt(id) }, {
        name: playerData.name,
        role: playerData.role,
        country: playerData.country,
        base_price: playerData.basePrice,
        current_bid: playerData.currentBid,
        status: playerData.status,
        set_category: playerData.setCategory,
        category_order: playerData.categoryOrder,
        team_id: playerData.teamId,
        sold_price: playerData.soldPrice,
        retained_amount: playerData.retainedAmount,
        stats: JSON.stringify(playerData.stats || {})
      })
      
      if (updated) {
        this.auctionState.players = this.getAllPlayers()
        this.socketManager.broadcastToAll('auction-state', this.auctionState)
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating player:', error)
      return false
    }
  }

  // Auction management
  startAuction() {
    try {
      // Create new auction session
      const session = this.dbHelpers.insert('auction_sessions', {
        name: `Auction ${new Date().toISOString()}`,
        status: 'active',
        timer: this.auctionState.timerLimit,
        timer_limit: this.auctionState.timerLimit
      })
      
      this.currentSession = session.id
      
      // Get first available player
      const availablePlayers = this.auctionState.players.filter(p => p.status === 'available')
      const firstPlayer = availablePlayers.length > 0 ? availablePlayers[0] : null
      
      this.auctionState.isAuctionActive = true
      this.auctionState.currentPlayer = firstPlayer
      this.auctionState.bids = []
      this.auctionState.timer = this.auctionState.timerLimit
      this.auctionState.isTimerRunning = false
      
      // Update session with current player
      if (firstPlayer) {
        this.dbHelpers.update('auction_sessions', { id: this.currentSession }, {
          current_player_id: firstPlayer.id
        })
      }
      
      this.socketManager.broadcastToAll('auction-state', this.auctionState)
      this.logAuctionAction('auction-started', { sessionId: this.currentSession })
      
      return true
    } catch (error) {
      console.error('Error starting auction:', error)
      return false
    }
  }

  pauseAuction() {
    try {
      this.auctionState.isAuctionActive = false
      this.auctionState.isTimerPaused = true
      
      if (this.currentSession) {
        this.dbHelpers.update('auction_sessions', { id: this.currentSession }, {
          status: 'paused'
        })
      }
      
      this.socketManager.broadcastToAll('auction-state', this.auctionState)
      this.logAuctionAction('auction-paused', {})
      
      return true
    } catch (error) {
      console.error('Error pausing auction:', error)
      return false
    }
  }

  endAuction() {
    try {
      this.auctionState.isAuctionActive = false
      this.auctionState.isTimerRunning = false
      this.auctionState.currentPlayer = null
      
      if (this.currentSession) {
        this.dbHelpers.update('auction_sessions', { id: this.currentSession }, {
          status: 'completed'
        })
      }
      
      this.socketManager.broadcastToAll('auction-state', this.auctionState)
      this.logAuctionAction('auction-ended', {})
      
      return true
    } catch (error) {
      console.error('Error ending auction:', error)
      return false
    }
  }

  // Bidding
  placeBid(playerId, teamName, amount, socketId) {
    try {
      const player = this.getPlayerById(playerId)
      const team = this.getTeamByName(teamName)
      
      if (!player || !team) {
        return { success: false, message: 'Player or team not found' }
      }

      if (player.status !== 'available') {
        return { success: false, message: 'Player is not available for bidding' }
      }

      if (amount <= player.current_bid) {
        return { success: false, message: 'Bid must be higher than current bid' }
      }

      if (amount > team.budget) {
        return { success: false, message: 'Insufficient budget' }
      }

      // Record the bid
      const bid = this.dbHelpers.insert('bids', {
        player_id: playerId,
        team_id: team.id,
        amount: amount,
        socket_id: socketId
      })

      // Update player's current bid
      this.updatePlayer(playerId, {
        ...player,
        currentBid: amount
      })

      // Add to auction state bids
      this.auctionState.bids.push({
        id: bid.id,
        playerId,
        teamName,
        amount,
        timestamp: new Date().toISOString()
      })

      this.socketManager.broadcastToAll('auction-state', this.auctionState)
      this.socketManager.broadcastToAll('new-bid', {
        playerId,
        teamName,
        amount,
        playerName: player.name
      })

      this.logAuctionAction('bid-placed', {
        playerId,
        teamName,
        amount,
        playerName: player.name
      })

      return { success: true, message: 'Bid placed successfully' }
    } catch (error) {
      console.error('Error placing bid:', error)
      return { success: false, message: 'Failed to place bid' }
    }
  }

  // Sell player
  sellPlayer(playerId, teamName, amount) {
    try {
      const player = this.getPlayerById(playerId)
      const team = this.getTeamByName(teamName)
      
      if (!player || !team) {
        return { success: false, message: 'Player or team not found' }
      }

      // Update player status
      this.updatePlayer(playerId, {
        ...player,
        status: 'sold',
        team_id: team.id,
        sold_price: amount
      })

      // Update team budget
      this.updateTeam(team.id, {
        ...team,
        budget: team.budget - amount
      })

      // Move to next player
      this.moveToNextPlayer()

      this.socketManager.broadcastToAll('auction-state', this.auctionState)
      this.logAuctionAction('player-sold', {
        playerId,
        teamName,
        amount,
        playerName: player.name
      })

      return { success: true, message: 'Player sold successfully' }
    } catch (error) {
      console.error('Error selling player:', error)
      return { success: false, message: 'Failed to sell player' }
    }
  }

  // Mark player as unsold
  markUnsold(playerId) {
    try {
      const player = this.getPlayerById(playerId)
      
      if (!player) {
        return { success: false, message: 'Player not found' }
      }

      // Update player status
      this.updatePlayer(playerId, {
        ...player,
        status: 'unsold'
      })

      // Move to next player
      this.moveToNextPlayer()

      this.socketManager.broadcastToAll('auction-state', this.auctionState)
      this.logAuctionAction('player-unsold', {
        playerId,
        playerName: player.name
      })

      return { success: true, message: 'Player marked as unsold' }
    } catch (error) {
      console.error('Error marking player unsold:', error)
      return { success: false, message: 'Failed to mark player unsold' }
    }
  }

  // Move to next available player
  moveToNextPlayer() {
    const availablePlayers = this.auctionState.players.filter(p => p.status === 'available')
    const currentIndex = availablePlayers.findIndex(p => p.id === this.auctionState.currentPlayer?.id)
    
    if (currentIndex < availablePlayers.length - 1) {
      this.auctionState.currentPlayer = availablePlayers[currentIndex + 1]
    } else {
      this.auctionState.currentPlayer = null
      this.auctionState.isAuctionActive = false
    }
    
    this.auctionState.bids = []
    this.auctionState.timer = this.auctionState.timerLimit
    this.auctionState.isTimerRunning = false
  }

  // Get auction statistics
  getAuctionStats() {
    try {
      const players = this.getAllPlayers()
      const teams = this.getAllTeams()
      
      return {
        totalPlayers: players.length,
        soldPlayers: players.filter(p => p.status === 'sold').length,
        unsoldPlayers: players.filter(p => p.status === 'unsold').length,
        availablePlayers: players.filter(p => p.status === 'available').length,
        totalBids: this.dbHelpers.count('bids'),
        teams: teams.map(team => ({
          ...team,
          playersCount: players.filter(p => p.team_id === team.id).length,
          totalSpent: players
            .filter(p => p.team_id === team.id)
            .reduce((sum, p) => sum + (p.sold_price || 0), 0)
        }))
      }
    } catch (error) {
      console.error('Error getting auction stats:', error)
      return null
    }
  }

  // Logging
  logAuctionAction(action, details) {
    try {
      this.dbHelpers.insert('auction_logs', {
        session_id: this.currentSession,
        action,
        details: JSON.stringify(details)
      })
    } catch (error) {
      console.error('Error logging auction action:', error)
    }
  }

  // Get current auction state
  getAuctionState() {
    return this.auctionState
  }
}

module.exports = AuctionService