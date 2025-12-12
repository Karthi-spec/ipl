import { create } from 'zustand'

export interface Room {
  id: string
  roomCode: string // 6-digit room code for easy sharing
  name: string
  createdBy: string
  createdAt: Date
  isActive: boolean
  adminCount: number // Track admin count (max 1)
  teamCount: number // Track team count (max 10)
  spectatorCount: number // Track spectator count (unlimited)
  totalParticipants: number
  isPrivate: boolean
  password?: string
  auctionType: 'ipl' | 'custom'
  status: 'waiting' | 'active' | 'completed'
  description?: string
}

export interface RoomParticipant {
  id: string
  name: string
  role: 'admin' | 'team' | 'spectator'
  teamName?: string
  joinedAt: Date
}

interface RoomState {
  // Current room data
  currentRoom: Room | null
  participants: RoomParticipant[]
  
  // Room list
  availableRooms: Room[]
  
  // User state
  currentUser: RoomParticipant | null
  
  // Actions
  createRoom: (roomData: Omit<Room, 'id' | 'roomCode' | 'createdAt' | 'adminCount' | 'teamCount' | 'spectatorCount' | 'totalParticipants'>) => Promise<string>
  joinRoom: (roomId: string, password?: string) => Promise<boolean>
  joinRoomWithRole: (roomId: string, role: 'admin' | 'team' | 'spectator', password?: string) => Promise<{ success: boolean; actualRole: 'admin' | 'team' | 'spectator' }>
  leaveRoom: (role?: 'admin' | 'team' | 'spectator') => void
  updateRoom: (roomId: string, updates: Partial<Room>) => void
  setCurrentUser: (user: RoomParticipant) => void
  fetchRooms: () => Promise<void>
  deleteRoom: (roomId: string) => void
}

export const useRoomStore = create<RoomState>((set, get) => ({
  currentRoom: null,
  participants: [],
  availableRooms: [],
  currentUser: null,

  createRoom: async (roomData) => {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    // Generate 6-digit room code
    const roomCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    const newRoom: Room = {
      ...roomData,
      id: roomId,
      roomCode,
      createdAt: new Date(),
      adminCount: 0, // No default admin - users must join as admin
      teamCount: 0,
      spectatorCount: 0,
      totalParticipants: 0, // No participants initially
      status: 'waiting'
    }

    // Add to available rooms
    set(state => ({
      availableRooms: [...state.availableRooms, newRoom],
      currentRoom: newRoom
    }))

    // Store in localStorage for persistence
    const rooms = JSON.parse(localStorage.getItem('auctionRooms') || '[]')
    rooms.push(newRoom)
    localStorage.setItem('auctionRooms', JSON.stringify(rooms))

    return roomId
  },

  joinRoom: async (roomId, password) => {
    const { availableRooms } = get()
    const room = availableRooms.find(r => r.id === roomId || r.roomCode === roomId)
    
    if (!room) {
      throw new Error('Room not found')
    }

    if (room.isPrivate && room.password !== password) {
      throw new Error('Invalid password')
    }

    set(state => ({
      currentRoom: room,
      availableRooms: state.availableRooms
    }))

    return true
  },

  joinRoomWithRole: async (roomId: string, role: 'admin' | 'team' | 'spectator', password?: string) => {
    const { availableRooms } = get()
    const room = availableRooms.find(r => r.id === roomId || r.roomCode === roomId)
    
    if (!room) {
      throw new Error('Room not found')
    }

    if (room.isPrivate && room.password !== password) {
      throw new Error('Invalid password')
    }

    // Check team limit (hard limit)
    if (role === 'team' && room.teamCount >= 10) {
      throw new Error('All team slots are taken (10 teams maximum)')
    }

    // Handle admin role - if admin slot is taken, automatically make them spectator
    let actualRole = role
    if (role === 'admin' && room.adminCount >= 1) {
      actualRole = 'spectator'
    }

    // Update counts based on actual role
    const updatedRoom = { 
      ...room, 
      adminCount: actualRole === 'admin' ? room.adminCount + 1 : room.adminCount,
      teamCount: actualRole === 'team' ? room.teamCount + 1 : room.teamCount,
      spectatorCount: actualRole === 'spectator' ? room.spectatorCount + 1 : room.spectatorCount,
      totalParticipants: room.totalParticipants + 1
    }
    
    set(state => ({
      currentRoom: updatedRoom,
      availableRooms: state.availableRooms.map(r => 
        r.id === roomId || r.roomCode === roomId ? updatedRoom : r
      )
    }))

    return { success: true, actualRole }
  },

  leaveRoom: (role?: 'admin' | 'team' | 'spectator') => {
    const { currentRoom } = get()
    if (currentRoom && role) {
      const updatedRoom = { 
        ...currentRoom, 
        adminCount: role === 'admin' ? Math.max(0, currentRoom.adminCount - 1) : currentRoom.adminCount,
        teamCount: role === 'team' ? Math.max(0, currentRoom.teamCount - 1) : currentRoom.teamCount,
        spectatorCount: role === 'spectator' ? Math.max(0, currentRoom.spectatorCount - 1) : currentRoom.spectatorCount,
        totalParticipants: Math.max(0, currentRoom.totalParticipants - 1)
      }
      
      set(state => ({
        currentRoom: null,
        currentUser: null,
        participants: [],
        availableRooms: state.availableRooms.map(r => 
          r.id === currentRoom.id ? updatedRoom : r
        )
      }))
    }
  },

  updateRoom: (roomId, updates) => {
    set(state => ({
      availableRooms: state.availableRooms.map(room =>
        room.id === roomId ? { ...room, ...updates } : room
      ),
      currentRoom: state.currentRoom?.id === roomId 
        ? { ...state.currentRoom, ...updates }
        : state.currentRoom
    }))
  },

  setCurrentUser: (user) => {
    set({ currentUser: user })
  },

  fetchRooms: async () => {
    // Load from localStorage
    const rooms = JSON.parse(localStorage.getItem('auctionRooms') || '[]')
    
    // Filter out old rooms (older than 24 hours)
    const validRooms = rooms.filter((room: Room) => {
      const roomAge = Date.now() - new Date(room.createdAt).getTime()
      return roomAge < 24 * 60 * 60 * 1000 // 24 hours
    })

    set({ availableRooms: validRooms })
    
    // Update localStorage with filtered rooms
    localStorage.setItem('auctionRooms', JSON.stringify(validRooms))
  },

  deleteRoom: (roomId) => {
    set(state => ({
      availableRooms: state.availableRooms.filter(r => r.id !== roomId),
      currentRoom: state.currentRoom?.id === roomId ? null : state.currentRoom
    }))

    // Update localStorage
    const rooms = JSON.parse(localStorage.getItem('auctionRooms') || '[]')
    const filteredRooms = rooms.filter((r: Room) => r.id !== roomId)
    localStorage.setItem('auctionRooms', JSON.stringify(filteredRooms))
  }
}))