#!/usr/bin/env node

const { setupDatabase } = require('../database/setup')
const fs = require('fs')
const path = require('path')

console.log('🔄 Starting database migration...')

try {
  // Setup database (creates tables if they don't exist)
  const db = setupDatabase()
  
  // Run any additional migration scripts
  const migrationsDir = path.join(__dirname, '../migrations')
  
  if (fs.existsSync(migrationsDir)) {
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()
    
    console.log(`📁 Found ${migrationFiles.length} migration files`)
    
    migrationFiles.forEach(file => {
      console.log(`⚡ Running migration: ${file}`)
      const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      
      try {
        db.exec(migrationSQL)
        console.log(`✅ Migration completed: ${file}`)
      } catch (error) {
        console.error(`❌ Migration failed: ${file}`, error)
        process.exit(1)
      }
    })
  }
  
  console.log('✅ Database migration completed successfully!')
  
} catch (error) {
  console.error('❌ Migration failed:', error)
  process.exit(1)
}