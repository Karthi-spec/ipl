import { create } from 'zustand'

export interface ConnectedClient {
  id: string
  type: 'admin' | 'team' | 'spectator'
  teamName?: string
  joinedAt: Date
  lastSeen: Date
  isActive: boolean
}

export interface ConnectionStats {
  total: number
  admins: number
  teams: number
  spectators: number
}

interface ConnectionState {
  connectedClients: ConnectedClient[]
  currentUserType: 'admin' | 'team' | 'spectator' | null
  currentUserTeam: string | null
  
  // Actions
  addClient: (client: Omit<ConnectedClient, 'id' | 'joinedAt' | 'lastSeen' | 'isActive'>) => void
  removeClient: (clientId: string) => void
  updateClientActivity: (clientId: string) => void
  setCurrentUser: (type: 'admin' | 'team' | 'spectator', teamName?: string) => void
  getStats: () => ConnectionStats
  getConnectedTeams: () => ConnectedClient[]
  isTeamConnected: (teamName: string) => boolean
  resetConnections: () => void
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connectedClients: [],
  currentUserType: null,
  currentUserTeam: null,

  addClient: (clientData) => {
    const newClient: ConnectedClient = {
      ...clientData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      joinedAt: new Date(),
      lastSeen: new Date(),
      isActive: true
    }

    set(state => ({
      connectedClients: [...state.connectedClients, newClient]
    }))
  },

  removeClient: (clientId) => {
    set(state => ({
      connectedClients: state.connectedClients.filter(client => client.id !== clientId)
    }))
  },

  updateClientActivity: (clientId) => {
    set(state => ({
      connectedClients: state.connectedClients.map(client =>
        client.id === clientId
          ? { ...client, lastSeen: new Date() }
          : client
      )
    }))
  },

  setCurrentUser: (type, teamName) => {
    const { addClient, connectedClients } = get()
    
    // Remove any existing client for this user
    const existingClient = connectedClients.find(c => 
      c.type === type && (type !== 'team' || c.teamName === teamName)
    )
    
    if (!existingClient) {
      // Add new client
      addClient({
        type,
        teamName: type === 'team' ? teamName : undefined
      })
    }

    set({
      currentUserType: type,
      currentUserTeam: type === 'team' ? teamName || null : null
    })
  },

  getStats: () => {
    const { connectedClients } = get()
    return {
      total: connectedClients.length,
      admins: connectedClients.filter(c => c.type === 'admin').length,
      teams: connectedClients.filter(c => c.type === 'team').length,
      spectators: connectedClients.filter(c => c.type === 'spectator').length
    }
  },

  getConnectedTeams: () => {
    const { connectedClients } = get()
    return connectedClients.filter(client => client.type === 'team' && client.isActive)
  },

  isTeamConnected: (teamName) => {
    const { connectedClients } = get()
    return connectedClients.some(client => 
      client.type === 'team' && 
      client.teamName === teamName && 
      client.isActive
    )
  },

  resetConnections: () => {
    set({
      connectedClients: [],
      currentUserType: null,
      currentUserTeam: null
    })
  }
}))