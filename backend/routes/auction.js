const express = require('express')
const { body, validationResult } = require('express-validator')
const { authenticateToken, isAdmin } = require('../middleware/auth')

const router = express.Router()

// Get current auction state
router.get('/state', (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const state = auctionService.getAuctionState()
    
    res.json({
      success: true,
      data: state
    })
  } catch (error) {
    console.error('Error getting auction state:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get auction state'
    })
  }
})

// Get auction statistics
router.get('/stats', (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const stats = auctionService.getAuctionStats()
    
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error getting auction stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get auction statistics'
    })
  }
})

// Start auction (admin only)
router.post('/start', authenticateToken, isAdmin, (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const result = auctionService.startAuction()
    
    if (result) {
      res.json({
        success: true,
        message: 'Auction started successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to start auction'
      })
    }
  } catch (error) {
    console.error('Error starting auction:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Pause auction (admin only)
router.post('/pause', authenticateToken, isAdmin, (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const result = auctionService.pauseAuction()
    
    if (result) {
      res.json({
        success: true,
        message: 'Auction paused successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to pause auction'
      })
    }
  } catch (error) {
    console.error('Error pausing auction:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Reset auction (admin only)
router.post('/reset', authenticateToken, isAdmin, (req, res) => {
  try {
    const auctionService = req.app.locals.auctionService
    const result = auctionService.resetAuction()
    
    if (result) {
      res.json({
        success: true,
        message: 'Auction reset successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to reset auction'
      })
    }
  } catch (error) {
    console.error('Error resetting auction:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Place bid
router.post('/bid', [
  body('playerId').isInt({ min: 1 }).withMessage('Valid player ID is required'),
  body('teamName').trim().isLength({ min: 1 }).withMessage('Team name is required'),
  body('amount').isFloat({ min: 0.1 }).withMessage('Valid bid amount is required')
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
    const bidData = req.body
    
    const result = auctionService.placeBid(bidData)
    
    if (result) {
      res.json({
        success: true,
        message: 'Bid placed successfully',
        data: result
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to place bid'
      })
    }
  } catch (error) {
    console.error('Error placing bid:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to place bid'
    })
  }
})

// Sell player (admin only)
router.post('/sell', [
  authenticateToken,
  isAdmin,
  body('playerId').isInt({ min: 1 }).withMessage('Valid player ID is required'),
  body('teamName').trim().isLength({ min: 1 }).withMessage('Team name is required'),
  body('amount').isFloat({ min: 0.1 }).withMessage('Valid amount is required')
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
    const { playerId, teamName, amount } = req.body
    
    const result = auctionService.sellPlayer(playerId, teamName, amount)
    
    if (result) {
      res.json({
        success: true,
        message: 'Player sold successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to sell player'
      })
    }
  } catch (error) {
    console.error('Error selling player:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Mark player as unsold (admin only)
router.post('/unsold', [
  authenticateToken,
  isAdmin,
  body('playerId').isInt({ min: 1 }).withMessage('Valid player ID is required')
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
    const { playerId } = req.body
    
    const result = auctionService.markPlayerUnsold(playerId)
    
    if (result) {
      res.json({
        success: true,
        message: 'Player marked as unsold'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to mark player as unsold'
      })
    }
  } catch (error) {
    console.error('Error marking player unsold:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Bring back unsold player (admin only)
router.post('/bring-back', [
  authenticateToken,
  isAdmin,
  body('playerId').isInt({ min: 1 }).withMessage('Valid player ID is required')
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
    const { playerId } = req.body
    
    const result = auctionService.bringBackUnsoldPlayer(playerId)
    
    if (result) {
      res.json({
        success: true,
        message: 'Player brought back to auction'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to bring back player'
      })
    }
  } catch (error) {
    console.error('Error bringing back player:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

module.exports = router