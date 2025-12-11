const path = require('path')
const fs = require('fs')

let db = null

function setupDatabase() {
  try {
    // Ensure database directory exists
    const dbDir = path.dirname(process.env.DATABASE_URL || './database/auction.json')
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    // Initialize JSON database
    const dbPath = process.env.DATABASE_URL || './database/auction.json'
    
    if (!fs.existsSync(dbPath)) {
      // Create empty database structure
      db = {
        users: [],
        teams: [],
        players: [],
        bids: [],
        auction_sessions: [],
        auction_logs: [],
        connected_clients: [],
        system_settings: []
      }
      saveDatabase()
    } else {
      // Load existing database
      const data = fs.readFileSync(dbPath, 'utf8')
      db = JSON.parse(data)
    }
    
    console.log('📊 JSON Database connected successfully')
    
    // Insert default data if tables are empty
    seedDefaultData()
    
    return db
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

function saveDatabase() {
  try {
    const dbPath = process.env.DATABASE_URL || './database/auction.json'
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
  } catch (error) {
    console.error('❌ Failed to save database:', error)
  }
}

// JSON database helper functions
function generateId(table) {
  if (!db[table] || db[table].length === 0) return 1
  return Math.max(...db[table].map(item => item.id || 0)) + 1
}

function insert(table, data) {
  if (!db[table]) db[table] = []
  const id = generateId(table)
  const record = {
    id,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  db[table].push(record)
  saveDatabase()
  return record
}

function findOne(table, condition) {
  if (!db[table]) return null
  return db[table].find(item => {
    return Object.keys(condition).every(key => item[key] === condition[key])
  })
}

function findAll(table, condition = {}) {
  if (!db[table]) return []
  if (Object.keys(condition).length === 0) return db[table]
  return db[table].filter(item => {
    return Object.keys(condition).every(key => item[key] === condition[key])
  })
}

function update(table, condition, data) {
  if (!db[table]) return null
  const index = db[table].findIndex(item => {
    return Object.keys(condition).every(key => item[key] === condition[key])
  })
  if (index === -1) return null
  
  db[table][index] = {
    ...db[table][index],
    ...data,
    updated_at: new Date().toISOString()
  }
  saveDatabase()
  return db[table][index]
}

function deleteRecord(table, condition) {
  if (!db[table]) return false
  const index = db[table].findIndex(item => {
    return Object.keys(condition).every(key => item[key] === condition[key])
  })
  if (index === -1) return false
  
  db[table].splice(index, 1)
  saveDatabase()
  return true
}

function count(table, condition = {}) {
  if (!db[table]) return 0
  if (Object.keys(condition).length === 0) return db[table].length
  return db[table].filter(item => {
    return Object.keys(condition).every(key => item[key] === condition[key])
  }).length
}

function seedDefaultData() {
  const bcrypt = require('bcryptjs')
  
  // Check if admin user exists
  const adminExists = findOne('users', { username: 'admin' })
  
  if (!adminExists) {
    // Create default admin user
    const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 12)
    insert('users', {
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    })
    console.log('👤 Default admin user created (username: admin)')
  }

  // Check if teams exist
  const teamsCount = count('teams')
  
  if (teamsCount === 0) {
    // Insert default IPL teams
    const teams = [
      { name: 'Mumbai Indians', budget: 125.0, color: '#004BA0', logo: '/logos/mumbai-indians.png', rtm_available: 1, retentions_used: 0 },
      { name: 'Chennai Super Kings', budget: 125.0, color: '#FDB913', logo: '/logos/chennai-super-kings.png', rtm_available: 1, retentions_used: 0 },
      { name: 'Royal Challengers Bangalore', budget: 125.0, color: '#EC1C24', logo: '/logos/rcb.png', rtm_available: 1, retentions_used: 0 },
      { name: 'Kolkata Knight Riders', budget: 125.0, color: '#6A4A9E', logo: '/logos/kkr.png', rtm_available: 1, retentions_used: 0 },
      { name: 'Delhi Capitals', budget: 125.0, color: '#004C93', logo: '/logos/delhi-capitals.png', rtm_available: 1, retentions_used: 0 },
      { name: 'Punjab Kings', budget: 125.0, color: '#DD1F2D', logo: '/logos/punjab-kings.png', rtm_available: 1, retentions_used: 0 },
      { name: 'Rajasthan Royals', budget: 125.0, color: '#254AA5', logo: '/logos/rajasthan-royals.png', rtm_available: 1, retentions_used: 0 },
      { name: 'Sunrisers Hyderabad', budget: 125.0, color: '#FF822A', logo: '/logos/srh.png', rtm_available: 1, retentions_used: 0 },
      { name: 'Gujarat Titans', budget: 125.0, color: '#4A90E2', logo: '/logos/gujarat-titans.png', rtm_available: 1, retentions_used: 0 },
      { name: 'Lucknow Super Giants', budget: 125.0, color: '#0E7BC6', logo: '/logos/lsg.png', rtm_available: 1, retentions_used: 0 }
    ]

    teams.forEach(team => {
      insert('teams', team)
    })
    console.log('🏏 Default IPL teams created')
  }

  // Insert default system settings
  const settingsCount = count('system_settings')
  
  if (settingsCount === 0) {
    const settings = [
      { key: 'auction_name', value: 'IPL 2025 Auction', description: 'Current auction name' },
      { key: 'timer_default', value: '30', description: 'Default timer duration in seconds' },
      { key: 'max_retentions', value: '6', description: 'Maximum retentions per team' },
      { key: 'max_rtm', value: '1', description: 'Maximum RTM per team' },
      { key: 'min_bid_increment', value: '0.25', description: 'Minimum bid increment in crores' }
    ]

    settings.forEach(setting => {
      insert('system_settings', setting)
    })
    console.log('⚙️  Default system settings created')
  }
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call setupDatabase() first.')
  }
  return {
    db,
    insert,
    findOne,
    findAll,
    update,
    deleteRecord,
    count,
    saveDatabase
  }
}

function closeDatabase() {
  if (db) {
    saveDatabase()
    console.log('📊 Database connection closed')
  }
}

module.exports = {
  setupDatabase,
  getDatabase,
  closeDatabase,
  insert,
  findOne,
  findAll,
  update,
  deleteRecord,
  count
}