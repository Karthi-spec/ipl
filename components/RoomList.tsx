'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Lock, Globe, Trophy, Clock, Eye, RefreshCw, Search } from 'lucide-react'
import { useRoomStore, Room } from '@/store/roomStore'

interface RoomListProps {
  onJoinRoom: (roomId: string) => void
}

export default function RoomList({ onJoinRoom }: RoomListProps) {
  const { availableRooms, fetchRooms } = useRoomStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [password, setPassword] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showJoinByCode, setShowJoinByCode] = useState(false)
  const [roomCode, setRoomCode] = useState('')

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchRooms()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const filteredRooms = availableRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleJoinClick = (room: Room) => {
    if (room.isPrivate) {
      setSelectedRoom(room)
    } else {
      onJoinRoom(room.id)
    }
  }

  const handleJoinPrivateRoom = () => {
    if (selectedRoom && password) {
      onJoinRoom(selectedRoom.id)
      setSelectedRoom(null)
      setPassword('')
    }
  }

  const handleJoinByCode = () => {
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim())
      setShowJoinByCode(false)
      setRoomCode('')
    }
  }

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400'
      case 'active': return 'text-green-400'
      case 'completed': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusText = (status: Room['status']) => {
    switch (status) {
      case 'waiting': return 'Waiting for players'
      case 'active': return 'Auction in progress'
      case 'completed': return 'Completed'
      default: return 'Unknown'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Available Auction Rooms</h2>
          <p className="text-gray-400">Join an existing auction or create your own</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowJoinByCode(true)}
            className="glass-effect px-4 py-3 rounded-xl hover:bg-white/10 transition-all font-bold"
          >
            Join by Code
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="glass-effect p-3 rounded-xl hover:bg-white/10 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search rooms by name or creator..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-gold-400 focus:outline-none"
        />
      </div>

      {/* Room List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredRooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Rooms Available</h3>
              <p className="text-gray-500">Be the first to create an auction room!</p>
            </motion.div>
          ) : (
            filteredRooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-effect p-6 rounded-2xl hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{room.name}</h3>
                      <div className="bg-gold-500/20 px-3 py-1 rounded-lg">
                        <span className="text-gold-400 font-bold text-sm">#{room.roomCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {room.isPrivate ? (
                          <Lock className="w-4 h-4 text-orange-400" />
                        ) : (
                          <Globe className="w-4 h-4 text-green-400" />
                        )}
                        <span className={`text-sm font-bold ${getStatusColor(room.status)}`}>
                          {getStatusText(room.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {room.totalParticipants} total
                      </div>
                      <div className="text-xs space-x-3">
                        <span className="text-red-400">Admin: {room.adminCount}/1</span>
                        <span className="text-blue-400">Teams: {room.teamCount}/10</span>
                        <span className="text-gray-400">Spectators: {room.spectatorCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTimeAgo(room.createdAt)}
                      </div>
                      <div>
                        by <span className="text-white font-bold">{room.createdBy}</span>
                      </div>
                    </div>

                    {room.description && (
                      <p className="text-gray-300 text-sm mb-3">{room.description}</p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleJoinClick(room)}
                    disabled={room.status === 'completed'}
                    className="gold-gradient px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {room.status === 'completed' ? (
                      <>
                        <Eye className="w-4 h-4" />
                        View
                      </>
                    ) : (
                      'Join'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Private Room Password Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-effect p-8 rounded-3xl max-w-md w-full"
            >
              <div className="text-center mb-6">
                <Lock className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                <h3 className="text-2xl font-bold text-white mb-2">Private Room</h3>
                <p className="text-gray-400">Enter password to join "{selectedRoom.name}"</p>
              </div>

              <div className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter room password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-gold-400 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinPrivateRoom()}
                />

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedRoom(null)
                      setPassword('')
                    }}
                    className="flex-1 glass-effect p-3 rounded-xl hover:bg-white/10 font-bold"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoinPrivateRoom}
                    disabled={!password.trim()}
                    className="flex-1 gold-gradient p-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Join Room
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Join by Room Code Modal */}
      <AnimatePresence>
        {showJoinByCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-effect p-8 rounded-3xl max-w-md w-full"
            >
              <div className="text-center mb-6">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gold-400" />
                <h3 className="text-2xl font-bold text-white mb-2">Join by Room Code</h3>
                <p className="text-gray-400">Enter the 6-digit room code to join</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-gold-400 focus:outline-none text-center text-2xl font-bold tracking-widest"
                  maxLength={6}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinByCode()}
                />

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowJoinByCode(false)
                      setRoomCode('')
                    }}
                    className="flex-1 glass-effect p-3 rounded-xl hover:bg-white/10 font-bold"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoinByCode}
                    disabled={roomCode.length !== 6}
                    className="flex-1 gold-gradient p-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Join Room
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}