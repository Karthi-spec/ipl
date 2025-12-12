'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Users, Shield, Eye } from 'lucide-react'
import { useRoomStore } from '@/store/roomStore'

export default function RoomInfoBar() {
  const { currentRoom } = useRoomStore()
  const [copied, setCopied] = useState(false)

  if (!currentRoom) return null

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentRoom.roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy room code:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect p-4 rounded-2xl mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">{currentRoom.name}</h3>
            <div className="bg-gold-500/20 px-3 py-1 rounded-lg flex items-center gap-2">
              <span className="text-gold-400 font-bold">#{currentRoom.roomCode}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyCode}
                className="text-gold-400 hover:text-gold-300 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            <span className={`font-bold ${currentRoom.adminCount > 0 ? 'text-red-400' : 'text-gray-500'}`}>
              {currentRoom.adminCount}/1
            </span>
            <span className="text-gray-400">Admin</span>
            {currentRoom.adminCount === 0 && (
              <span className="text-yellow-400 text-xs">(Needed)</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-bold">{currentRoom.teamCount}/10</span>
            <span className="text-gray-400">Teams</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 font-bold">{currentRoom.spectatorCount}</span>
            <span className="text-gray-400">Spectators</span>
          </div>
        </div>
      </div>

      {copied && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold"
        >
          Room code copied!
        </motion.div>
      )}
    </motion.div>
  )
}