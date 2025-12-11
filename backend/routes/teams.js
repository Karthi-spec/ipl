const express = require('express')
const { body, validationResult } = require('express-validator')
const { authenticateToken, isAdmin } = require('../middleware/auth')

const router = express.Router()

// Get all teams
router.get('/', (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const teams = auctionService.getAllTeams()
    
    res.json({
      success: true,
      data: teams,
      count: teams.length
    })
  } catch (error) {
    console.error('Error getting teams:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get teams'
    })
  }
})

// Get team by ID
router.get('/:id', (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const team = auctionService.getTeamById(req.params.id)
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      })
    }
    
    res.json({
      success: true,
      data: team
    })
  } catch (error) {
    console.error('Error getting team:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get team'
    })
  }
})

// Get team with players
router.get('/:id/players', (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const team = auctionService.getTeamById(req.params.id)
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      })
    }
    
    const allPlayers = auctionService.getAllPlayers()
    const teamPlayers = allPlayers.filter(p => p.team_id == req.params.id)
    
    res.json({
      success: true,
      data: {
        ...team,
        players: teamPlayers
      }
    })
  } catch (error) {
    console.error('Error getting team with players:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get team data'
    })
  }
})

// Add new team (admin only)
router.post('/', [
  authenticateToken,
  isAdmin,
  body('name').trim().isLength({ min: 1 }).withMessage('Team name is required'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Valid budget is required'),
  body('color').optional().trim().isLength({ min: 1 }).withMessage('Color cannot be empty'),
  body('logo').optional().trim().isLength({ min: 1 }).withMessage('Logo URL cannot be empty')
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

    const { getDatabase } = require('../database/setup')
    const db = getDatabase()
    
    const stmt = db.prepare(`
      INSERT INTO teams (name, budget, color, logo)
      VALUES (?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      req.body.name,
      req.body.budget || 125.0,
      req.body.color || '#000000',
      req.body.logo || ''
    )
    
    if (result.changes > 0) {
      // Refresh auction service state
      const auctionService = req.app.locals.auctionService
      auctionService.auctionState.teams = auctionService.getAllTeams()
      
      res.status(201).json({
        success: true,
        message: 'Team added successfully',
        data: { id: result.lastInsertRowid }
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to add team'
      })
    }
  } catch (error) {
    console.error('Error adding team:', error)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({
        success: false,
        message: 'Team name already exists'
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
})

// Update team (admin only)
router.put('/:id', [
  authenticateToken,
  isAdmin,
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Team name cannot be empty'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Valid budget is required'),
  body('color').optional().trim().isLength({ min: 1 }).withMessage('Color cannot be empty'),
  body('logo').optional().trim().isLength({ min: 1 }).withMessage('Logo URL cannot be empty')
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
    const teamId = req.params.id
    
    // Get current team data
    const currentTeam = auctionService.getTeamById(teamId)
    if (!currentTeam) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      })
    }
    
    // Merge with updates
    const teamData = {
      name: req.body.name || currentTeam.name,
      budget: req.body.budget !== undefined ? req.body.budget : currentTeam.budget,
      color: req.body.color || currentTeam.color,
      logo: req.body.logo || currentTeam.logo,
      rtmAvailable: req.body.rtmAvailable !== undefined ? req.body.rtmAvailable : currentTeam.rtm_available,
      retentionsUsed: req.body.retentionsUsed !== undefined ? req.body.retentionsUsed : currentTeam.retentions_used
    }
    
    const result = auctionService.updateTeam(teamId, teamData)
    
    if (result) {
      res.json({
        success: true,
        message: 'Team updated successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update team'
      })
    }
  } catch (error) {
    console.error('Error updating team:', error)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({
        success: false,
        message: 'Team name already exists'
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
})

// Delete team (admin only)
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const { getDatabase } = require('../database/setup')
    const db = getDatabase()
    
    // Check if team has players
    const playersStmt = db.prepare('SELECT COUNT(*) as count FROM players WHERE team_id = ?')
    const playersCount = playersStmt.get(req.params.id)
    
    if (playersCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete team with players. Remove players first.'
      })
    }
    
    const stmt = db.prepare('DELETE FROM teams WHERE id = ?')
    const result = stmt.run(req.params.id)
    
    if (result.changes > 0) {
      // Refresh auction service state
      const auctionService = req.app.locals.auctionService
      auctionService.auctionState.teams = auctionService.getAllTeams()
      
      res.json({
        success: true,
        message: 'Team deleted successfully'
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'Team not found'
      })
    }
  } catch (error) {
    console.error('Error deleting team:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get team statistics
router.get('/:id/stats', (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const team = auctionService.getTeamById(req.params.id)
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      })
    }
    
    const allPlayers = auctionService.getAllPlayers()
    const teamPlayers = allPlayers.filter(p => p.team_id == req.params.id)
    
    const stats = {
      totalPlayers: teamPlayers.length,
      totalSpent: 125 - team.budget,
      remainingBudget: team.budget,
      retentionsUsed: team.retentions_used,
      rtmAvailable: team.rtm_available,
      playersByRole: {
        batsman: teamPlayers.filter(p => p.role === 'Batsman').length,
        bowler: teamPlayers.filter(p => p.role === 'Bowler').length,
        allRounder: teamPlayers.filter(p => p.role === 'All-Rounder').length,
        wicketKeeper: teamPlayers.filter(p => p.role === 'Wicket-Keeper').length
      },
      playersByCountry: {
        indian: teamPlayers.filter(p => p.country === 'India').length,
        overseas: teamPlayers.filter(p => p.country !== 'India').length
      },
      averagePrice: teamPlayers.length > 0 
        ? teamPlayers.reduce((sum, p) => sum + (p.sold_price || p.retained_amount || 0), 0) / teamPlayers.length 
        : 0,
      mostExpensive: teamPlayers.length > 0 
        ? Math.max(...teamPlayers.map(p => p.sold_price || p.retained_amount || 0))
        : 0
    }
    
    res.json({
      success: true,
      data: {
        team,
        stats,
        players: teamPlayers
      }
    })
  } catch (error) {
    console.error('Error getting team stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get team statistics'
    })
  }
})

module.exports = router