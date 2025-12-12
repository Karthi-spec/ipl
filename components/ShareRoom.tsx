'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Copy, Check, QrCode, Users, Globe } from 'lucide-react'
import { useRoomStore } from '@/store/roomStore'

interface ShareRoomProps {
  show: boolean
  onClose: () => void
}

export default function ShareRoom({ show, onClose }: ShareRoomProps) {
  const { currentRoom } = useRoomStore()
  const [copied, setCopied] = useState<string | null>(null)

  if (!show || !currentRoom) return null

  const gameUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const roomUrl = `${gameUrl}?room=${currentRoom.roomCode}`

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my IPL Auction Game!',
          text: `Join my IPL auction room: ${currentRoom.name}. Room code: ${currentRoom.roomCode}`,
          url: roomUrl,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      handleCopy(roomUrl, 'url')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="glass-effect p-8 rounded-3xl max-w-md w-full border-2 border-blue-500/50"
      >
        <div className="text-center mb-6">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mx-auto mb-4 w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center"
          >
            <Globe className="w-8 h-8 text-blue-400" />
          </motion.div>

          <h2 className="text-3xl font-bold text-blue-400 mb-2">
            Share Globally!
          </h2>
          <p className="text-gray-300">
            Invite friends from anywhere in the world
          </p>
        </div>

        {/* Room Details */}
        <div className="bg-white/5 p-4 rounded-xl mb-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">{currentRoom.name}</h3>
            <div className="text-3xl font-bold text-gold-400 mb-2">#{currentRoom.roomCode}</div>
            <div className="text-sm text-gray-400">Room Code</div>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-3 mb-6">
          {/* Share URL */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={roomUrl}
              readOnly
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCopy(roomUrl, 'url')}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 p-3 rounded-xl"
            >
              {copied === 'url' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-blue-400" />}
            </motion.button>
          </div>

          {/* Share Room Code */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={`Room Code: ${currentRoom.roomCode}`}
              readOnly
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCopy(currentRoom.roomCode, 'code')}
              className="bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/50 p-3 rounded-xl"
            >
              {copied === 'code' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gold-400" />}
            </motion.button>
          </div>
        </div>

        {/* Share Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 mb-4"
        >
          <Share2 className="w-5 h-5" />
          Share with Friends
        </motion.button>

        {/* Instructions */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
          <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            How Friends Can Join:
          </h4>
          <div className="text-sm text-green-300 space-y-1">
            <div>1. Share the room URL or code</div>
            <div>2. Friends visit the game website</div>
            <div>3. Enter the room code: <span className="font-bold">#{currentRoom.roomCode}</span></div>
            <div>4. Choose their role and team</div>
            <div>5. Start playing together!</div>
          </div>
        </div>

        {/* Global Access Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Global Access:
          </h4>
          <div className="text-sm text-blue-300 space-y-1">
            <div>✅ Works from any country</div>
            <div>✅ Mobile and desktop friendly</div>
            <div>✅ Real-time synchronization</div>
            <div>✅ No app download required</div>
          </div>
        </div>

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full glass-effect p-3 rounded-xl hover:bg-white/10 font-bold"
        >
          Close
        </motion.button>
      </motion.div>
    </div>
  )
}