'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface EndRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function EndRoomModal({ isOpen, onClose, onConfirm }: EndRoomModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="glass-effect p-8 rounded-3xl max-w-md w-full border-2 border-red-500/50"
      >
        <div className="text-center">
          {/* Warning Icon */}
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
            className="mx-auto mb-6 w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center"
          >
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-red-400 mb-4">
            End Room?
          </h2>

          {/* Description */}
          <div className="text-gray-300 mb-8 space-y-3">
            <p className="text-lg">
              This will permanently terminate the room and disconnect all participants.
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-sm text-red-300 font-semibold">
                ⚠️ This action cannot be undone!
              </p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                <li>• All participants will be disconnected</li>
                <li>• The room will be removed from the room list</li>
                <li>• Current auction progress will be lost</li>
                <li>• Everyone will return to room selection</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="glass-effect p-4 rounded-xl hover:bg-white/10 font-bold transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConfirm}
              className="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 p-4 rounded-xl font-bold text-red-400 transition-all"
            >
              End Room
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}