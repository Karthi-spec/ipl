const express = require('express')
const { body, validationResult } = require('express-validator')
const { authenticateToken, isAdmin } = require('../middleware/auth')

const router = express.Router()

// Get all players
router.get('/', (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const players = auctionService.getAllPlayers()
    
    res.json({
      success: true,
      data: players,
      count: players.length
    })
  } catch (error) {
    console.error('Error getting players:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get players'
    })
  }
})

// Get player by ID
router.get('/:id', (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const player = auctionService.getPlayerById(req.params.id)
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      })
    }
    
    res.json({
      success: true,
      data: player
    })
  } catch (error) {
    console.error('Error getting player:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get player'
    })
  }
})

// Add new player (admin only)
router.post('/', [
  authenticateToken,
  isAdmin,
  body('name').trim().isLength({ min: 1 }).withMessage('Player name is required'),
  body('role').trim().isIn(['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper']).withMessage('Valid role is required'),
  body('country').trim().isLength({ min: 1 }).withMessage('Country is required'),
  body('basePrice').isFloat({ min: 0.1 }).withMessage('Valid base price is required')
], (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const auctionService = req.app.locals.auctionService
    const playerData = {
      name: req.body.name,
      role: req.body.role,
      country: req.body.country,
      basePrice: req.body.basePrice,
      setCategory: req.body.setCategory || 'Uncapped',
      categoryOrder: req.body.categoryOrder || 99,
      stats: req.body.stats || {}
    }
    
    const playerId = auctionService.addPlayer(playerData)
    
    if (playerId) {
      res.status(201).json({
        success: true,
        message: 'Player added successfully',
        data: { id: playerId }
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to add player'
      })
    }
  } catch (error) {
    console.error('Error adding player:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Update player (admin only)
router.put('/:id', [
  authenticateToken,
  isAdmin,
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Player name cannot be empty'),
  body('role').optional().trim().isIn(['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper']).withMessage('Valid role is required'),
  body('country').optional().trim().isLength({ min: 1 }).withMessage('Country cannot be empty'),
  body('basePrice').optional().isFloat({ min: 0.1 }).withMessage('Valid base price is required')
], (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const auctionService = req.app.locals.auctionService
    const playerId = req.params.id
    
    // Get current player data
    const currentPlayer = auctionService.getPlayerById(playerId)
    if (!currentPlayer) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      })
    }
    
    // Merge with updates
    const playerData = {
      name: req.body.name || currentPlayer.name,
      role: req.body.role || currentPlayer.role,
      country: req.body.country || currentPlayer.country,
      basePrice: req.body.basePrice || currentPlayer.base_price,
      currentBid: req.body.currentBid || currentPlayer.current_bid,
      status: req.body.status || currentPlayer.status,
      setCategory: req.body.setCategory || currentPlayer.set_category,
      categoryOrder: req.body.categoryOrder || currentPlayer.category_order,
      teamId: req.body.teamId || currentPlayer.team_id,
      soldPrice: req.body.soldPrice || currentPlayer.sold_price,
      retainedAmount: req.body.retainedAmount || currentPlayer.retained_amount,
      stats: req.body.stats || currentPlayer.stats
    }
    
    const result = auctionService.updatePlayer(playerId, playerData)
    
    if (result) {
      res.json({
        success: true,
        message: 'Player updated successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update player'
      })
    }
  } catch (error) {
    console.error('Error updating player:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Delete player (admin only)
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const { getDatabase } = require('../database/setup')
    const db = getDatabase()
    
    const stmt = db.prepare('DELETE FROM players WHERE id = ?')
    const result = stmt.run(req.params.id)
    
    if (result.changes > 0) {
      // Refresh auction service state
      const auctionService = req.app.locals.auctionService
      auctionService.auctionState.players = auctionService.getAllPlayers()
      
      res.json({
        success: true,
        message: 'Player deleted successfully'
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'Player not found'
      })
    }
  } catch (error) {
    console.error('Error deleting player:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get players by status
router.get('/status/:status', (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const allPlayers = auctionService.getAllPlayers()
    const players = allPlayers.filter(p => p.status === req.params.status)
    
    res.json({
      success: true,
      data: players,
      count: players.length
    })
  } catch (error) {
    console.error('Error getting players by status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get players'
    })
  }
})

// Get players by team
router.get('/team/:teamId', (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const allPlayers = auctionService.getAllPlayers()
    const players = allPlayers.filter(p => p.team_id == req.params.teamId)
    
    res.json({
      success: true,
      data: players,
      count: players.length
    })
  } catch (error) {
    console.error('Error getting players by team:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get players'
    })
  }
})

module.exports = router