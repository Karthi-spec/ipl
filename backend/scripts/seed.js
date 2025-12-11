#!/usr/bin/env node

const { setupDatabase, getDatabase, insert, count, findAll } = require('../database/setup')
const fs = require('fs')
const path = require('path')

console.log('🌱 Starting database seeding...')

try {
  // Setup database first
  setupDatabase()
  const dbHelpers = getDatabase()
  
  // Load players data from JSON file
  const playersDataPath = path.join(__dirname, '../../players.json')
  
  if (fs.existsSync(playersDataPath)) {
    console.log('📊 Loading players data from players.json...')
    
    const playersData = JSON.parse(fs.readFileSync(playersDataPath, 'utf8'))
    
    if (playersData.players && Array.isArray(playersData.players)) {
      console.log(`👥 Found ${playersData.players.length} players to import`)
      
      // Check if players already exist
      const existingPlayersCount = count('players')
      
      if (existingPlayersCount > 0) {
        console.log(`⚠️  Database already contains ${existingPlayersCount} players`)
        console.log('🔄 Skipping player import (use --force to override)')
        
        if (!process.argv.includes('--force')) {
          process.exit(0)
        }
        
        console.log('🗑️  Clearing existing players...')
        dbHelpers.db.players = []
        dbHelpers.saveDatabase()
      }
      
      // Team name mapping
      const teamNameMapping = {
        'MI': 'Mumbai Indians',
        'CSK': 'Chennai Super Kings',
        'RCB': 'Royal Challengers Bangalore',
        'KKR': 'Kolkata Knight Riders',
        'DC': 'Delhi Capitals',
        'PBKS': 'Punjab Kings',
        'RR': 'Rajasthan Royals',
        'SRH': 'Sunrisers Hyderabad',
        'GT': 'Gujarat Titans',
        'LSG': 'Lucknow Super Giants'
      }
      
      let importedCount = 0
      
      // Import players
      playersData.players.forEach(player => {
        try {
          const stats = {
            matches: player.iplCaps || 0,
            runs: 0,
            average: 0,
            strikeRate: 0,
            wickets: 0,
            economy: 0
          }
          
          const playerData = {
            name: player.name || player.fullName,
            role: player.specialism || 'All-Rounder',
            country: player.country || 'India',
            base_price: player.basePrice || 0.3,
            current_bid: player.basePrice || 0.3,
            status: 'available',
            set_category: player.category || 'Uncapped',
            category_order: player.categoryOrder || 99,
            previous_team: teamNameMapping[player.previousTeam] || player.previousTeam || null,
            stats: JSON.stringify(stats)
          }
          
          insert('players', playerData)
          importedCount++
        } catch (error) {
          console.error(`❌ Failed to import player: ${player.name}`, error.message)
        }
      })
      
      console.log(`✅ Successfully imported ${importedCount} players`)
    }
  } else {
    console.log('⚠️  No players.json file found, skipping player import')
  }
  
  // Load player ratings if available
  const ratingsDataPath = path.join(__dirname, '../../data/playerRatings.json')
  
  if (fs.existsSync(ratingsDataPath)) {
    console.log('⭐ Loading player ratings...')
    
    const ratingsData = JSON.parse(fs.readFileSync(ratingsDataPath, 'utf8'))
    
    if (ratingsData.players && Array.isArray(ratingsData.players)) {
      console.log(`📊 Found ratings for ${ratingsData.players.length} players`)
      
      let updatedCount = 0
      
      ratingsData.players.forEach(playerRating => {
        try {
          // Find player by name
          const players = findAll('players', { name: playerRating.name })
          
          if (players.length > 0) {
            const player = players[0]
            const currentStats = JSON.parse(player.stats || '{}')
            const updatedStats = {
              ...currentStats,
              rating: playerRating.rating,
              source: 'IPL Legacy Ratings'
            }
            
            // Update player stats
            const updated = dbHelpers.update('players', { id: player.id }, {
              stats: JSON.stringify(updatedStats)
            })
            
            if (updated) {
              updatedCount++
            }
          }
        } catch (error) {
          console.error(`❌ Failed to update rating for: ${playerRating.name}`, error.message)
        }
      })
      
      console.log(`✅ Updated ratings for ${updatedCount} players`)
    }
  }
  
  console.log('🎉 Database seeding completed successfully!')
  
} catch (error) {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
}