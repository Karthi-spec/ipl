'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trophy, Users, Zap } from 'lucide-react'
import CreateRoomModal from './CreateRoomModal'
import RoomList from './RoomList'
import { useRoomStore } from '@/store/roomStore'

interface RoomSelectionPageProps {
  onRoomJoined: (roomId: string) => void
}

export default function RoomSelectionPage({ onRoomJoined }: RoomSelectionPageProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { joinRoom } = useRoomStore()

  const handleCreateRoom = () => {
    setShowCreateModal(true)
  }

  const handleRoomCreated = (roomId: string) => {
    setShowCreateModal(false)
    // Join the created room - role selection will happen in the room
    onRoomJoined(roomId)
  }

  const handleJoinRoom = async (roomId: string, password?: string) => {
    try {
      await joinRoom(roomId, password)
      onRoomJoined(roomId)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to join room')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 mb-6">
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-4">
            IPL AUCTION ROOMS
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Create your own auction room or join existing ones. Experience the thrill of IPL auctions with friends!
          </p>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 mb-12"
        >
          {/* Create Room Card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateRoom}
            className="glass-effect p-8 rounded-3xl text-left group hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Create New Room</h3>
                <p className="text-gray-400">Start your own IPL auction</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>Customize auction settings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>Invite friends with room code</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>Full admin control</span>
              </div>
            </div>
          </motion.button>

          {/* Join Room Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-effect p-8 rounded-3xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Join Existing Room</h3>
                <p className="text-gray-400">Browse available auctions</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Real-time bidding experience</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Choose your favorite team</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Spectator mode available</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Room List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect p-8 rounded-3xl"
        >
          <RoomList onJoinRoom={handleJoinRoom} />
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Why Choose Our Auction Platform?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-effect p-6 rounded-2xl">
              <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-bold text-white mb-2">Real-time Bidding</h3>
              <p className="text-gray-400">Experience live auction action with instant updates and notifications</p>
            </div>
            <div className="glass-effect p-6 rounded-2xl">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-bold text-white mb-2">Multi-player Support</h3>
              <p className="text-gray-400">Support for up to 50 participants per room with team and spectator modes</p>
            </div>
            <div className="glass-effect p-6 rounded-2xl">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gold-400" />
              <h3 className="text-xl font-bold text-white mb-2">Professional Experience</h3>
              <p className="text-gray-400">Complete IPL auction simulation with 600+ players and realistic mechanics</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </div>
  )
}