'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Lock, Globe, Trophy } from 'lucide-react'
import { useRoomStore } from '@/store/roomStore'

interface CreateRoomModalProps {
  onClose: () => void
  onRoomCreated: (roomId: string) => void
}

export default function CreateRoomModal({ onClose, onRoomCreated }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('')
  const [description, setDescription] = useState('')
  // Removed maxParticipants - now fixed: 1 admin + 10 teams + unlimited spectators
  const [isPrivate, setIsPrivate] = useState(false)
  const [password, setPassword] = useState('')
  const [creatorName, setCreatorName] = useState('')

  const [isCreating, setIsCreating] = useState(false)
  
  const { createRoom } = useRoomStore()

  const handleCreate = async () => {
    if (!roomName.trim() || !creatorName.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (isPrivate && !password.trim()) {
      alert('Please set a password for private room')
      return
    }

    setIsCreating(true)
    
    try {
      const roomId = await createRoom({
        name: roomName.trim(),
        createdBy: creatorName.trim(),
        isActive: true,
        isPrivate,
        password: isPrivate ? password : undefined,
        auctionType: 'ipl',
        status: 'waiting',
        description: description.trim() || undefined
      })

      // Just pass the roomId - role selection happens after
      onRoomCreated(roomId)
    } catch (error) {
      console.error('Failed to create room:', error)
      alert('Failed to create room. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-effect p-6 rounded-3xl max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create Room</h1>
          <p className="text-gray-400 text-sm">Set up your IPL auction</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 glass-effect p-2 rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simplified Form */}
        <div className="space-y-4">
          {/* Creator Name */}
          <input
            type="text"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            placeholder="Your Name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-gold-400 focus:outline-none"
            maxLength={30}
          />

          {/* Room Name */}
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room Name (e.g., My IPL Auction)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-gold-400 focus:outline-none"
            maxLength={30}
          />

          {/* Privacy Toggle */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsPrivate(false)}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                !isPrivate
                  ? 'border-green-400 bg-green-500/20 text-green-400'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
              }`}
            >
              <Globe className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm font-bold">Public</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsPrivate(true)}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                isPrivate
                  ? 'border-orange-400 bg-orange-500/20 text-orange-400'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
              }`}
            >
              <Lock className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm font-bold">Private</div>
            </motion.button>
          </div>

          {/* Password Field */}
          {isPrivate && (
            <motion.input
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Room Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-gold-400 focus:outline-none"
              maxLength={20}
            />
          )}


        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 glass-effect p-3 rounded-xl hover:bg-white/10 font-bold"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            disabled={isCreating || !roomName.trim() || !creatorName.trim()}
            className="flex-1 gold-gradient p-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create'
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}