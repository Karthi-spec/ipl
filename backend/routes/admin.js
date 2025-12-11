const express = require('express')
const { getDatabase } = require('../database/setup')
const fs = require('fs')
const path = require('path')

const router = express.Router()

// Get system statistics
router.get('/stats', (req, res) => {
  try {
    const db = getDatabase()
    const auctionService = req.app.locals.auctionService
    const socketManager = req.app.locals.socketManager
    
    // Database stats
    const playersCount = db.prepare('SELECT COUNT(*) as count FROM players').get()
    const teamsCount = db.prepare('SELECT COUNT(*) as count FROM teams').get()
    const bidsCount = db.prepare('SELECT COUNT(*) as count FROM bids').get()
    const sessionsCount = db.prepare('SELECT COUNT(*) as count FROM auction_sessions').get()
    
    // Auction stats
    const auctionStats = auctionService.getAuctionStats()
    
    // Connection stats
    const connectionStats = socketManager.getRoomStats()
    
    // System stats
    const systemStats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
    
    res.json({
      success: true,
      data: {
        database: {
          players: playersCount.count,
          teams: teamsCount.count,
          bids: bidsCount.count,
          sessions: sessionsCount.count
        },
        auction: auctionStats,
        connections: connectionStats,
        system: systemStats
      }
    })
  } catch (error) {
    console.error('Error getting admin stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    })
  }
})

// Get auction logs
router.get('/logs', (req, res) => {
  try {
    const db = getDatabase()
    const limit = parseInt(req.query.limit) || 100
    const offset = parseInt(req.query.offset) || 0
    
    const stmt = db.prepare(`
      SELECT * FROM auction_logs 
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `)
    
    const logs = stmt.all(limit, offset)
    
    // Parse JSON details
    const parsedLogs = logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }))
    
    res.json({
      success: true,
      data: parsedLogs,
      pagination: {
        limit,
        offset,
        count: parsedLogs.length
      }
    })
  } catch (error) {
    console.error('Error getting logs:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get logs'
    })
  }
})

// Get connected clients
router.get('/clients', (req, res) => {
  try {
    const db = getDatabase()
    
    const stmt = db.prepare(`
      SELECT * FROM connected_clients 
      ORDER BY connected_at DESC
    `)
    
    const clients = stmt.all()
    
    res.json({
      success: true,
      data: clients,
      count: clients.length
    })
  } catch (error) {
    console.error('Error getting connected clients:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get connected clients'
    })
  }
})

// Create database backup
router.post('/backup', (req, res) => {
  try {
    const db = getDatabase()
    const backupDir = path.join(__dirname, '../backups')
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(backupDir, `auction-backup-${timestamp}.db`)
    
    // Create backup using SQLite backup API
    const backup = db.backup(backupPath)
    
    backup.step(-1) // Copy entire database
    backup.finish()
    
    res.json({
      success: true,
      message: 'Backup created successfully',
      data: {
        filename: `auction-backup-${timestamp}.db`,
        path: backupPath,
        size: fs.statSync(backupPath).size
      }
    })
  } catch (error) {
    console.error('Error creating backup:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create backup'
    })
  }
})

// List backups
router.get('/backups', (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../backups')
    
    if (!fs.existsSync(backupDir)) {
      return res.json({
        success: true,
        data: [],
        count: 0
      })
    }
    
    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        }
      })
      .sort((a, b) => b.created - a.created)
    
    res.json({
      success: true,
      data: files,
      count: files.length
    })
  } catch (error) {
    console.error('Error listing backups:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to list backups'
    })
  }
})

// Download backup
router.get('/backup/:filename', (req, res) => {
  try {
    const filename = req.params.filename
    const backupPath = path.join(__dirname, '../backups', filename)
    
    if (!fs.existsSync(backupPath) || !filename.endsWith('.db')) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      })
    }
    
    res.download(backupPath, filename)
  } catch (error) {
    console.error('Error downloading backup:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to download backup'
    })
  }
})

// System settings
router.get('/settings', (req, res) => {
  try {
    const db = getDatabase()
    
    const stmt = db.prepare('SELECT * FROM system_settings ORDER BY key')
    const settings = stmt.all()
    
    res.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error getting settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get settings'
    })
  }
})

// Update system setting
router.put('/settings/:key', (req, res) => {
  try {
    const db = getDatabase()
    const { key } = req.params
    const { value } = req.body
    
    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Value is required'
      })
    }
    
    const stmt = db.prepare(`
      UPDATE system_settings 
      SET value = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE key = ?
    `)
    
    const result = stmt.run(value, key)
    
    if (result.changes > 0) {
      res.json({
        success: true,
        message: 'Setting updated successfully'
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'Setting not found'
      })
    }
  } catch (error) {
    console.error('Error updating setting:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update setting'
    })
  }
})

// Clear logs
router.delete('/logs', (req, res) => {
  try {
    const db = getDatabase()
    const daysToKeep = parseInt(req.query.days) || 7
    
    const stmt = db.prepare(`
      DELETE FROM auction_logs 
      WHERE timestamp < datetime('now', '-${daysToKeep} days')
    `)
    
    const result = stmt.run()
    
    res.json({
      success: true,
      message: `Cleared ${result.changes} old log entries`,
      data: {
        deletedCount: result.changes,
        daysKept: daysToKeep
      }
    })
  } catch (error) {
    console.error('Error clearing logs:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to clear logs'
    })
  }
})

// System health check
router.get('/health', (req, res) => {
  try {
    const db = getDatabase()
    
    // Test database connection
    const dbTest = db.prepare('SELECT 1 as test').get()
    
    // Check disk space (simplified)
    const stats = fs.statSync(process.cwd())
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbTest.test === 1 ? 'healthy' : 'unhealthy',
        memory: process.memoryUsage().heapUsed < 1024 * 1024 * 1024 ? 'healthy' : 'warning', // 1GB threshold
        uptime: process.uptime() > 0 ? 'healthy' : 'unhealthy'
      },
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    }
    
    const overallHealthy = Object.values(health.checks).every(check => check === 'healthy')
    health.status = overallHealthy ? 'healthy' : 'degraded'
    
    res.json({
      success: true,
      data: health
    })
  } catch (error) {
    console.error('Error checking health:', error)
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      data: {
        status: 'unhealthy',
        error: error.message
      }
    })
  }
})

module.exports = router