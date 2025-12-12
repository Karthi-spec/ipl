'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Settings, Play, Users, Clock, Trophy } from 'lucide-react'
import { useRoomStore } from '@/store/roomStore'
import { useAuctionStore } from '@/store/auctionStore'
import RoomInfoBar from './RoomInfoBar'

interface WaitingRoomProps {
  userRole: 'admin' | 'team' | 'spectator' | null
  selectedTeam: string | null
  onRetentionStart: () => void
  onAuctionStart: () => void
  onBack: () => void
}

export default function WaitingRoom({ 
  userRole, 
  selectedTeam, 
  onRetentionStart, 
  onAuctionStart, 
  onBack 
}: WaitingRoomProps) {
  const { currentRoom } = useRoomStore()
  const { 
    startRetentionPhase, 
    completeRetentionPhase, 
    startAuction, 
    retentionPhaseActive,
    retentionPhaseComplete,
    limitsConfigured,
    updateTeamLimits
  } = useAuctionStore()
  
  const [showRetentionConfig, setShowRetentionConfig] = useState(false)
  const [maxRetentions, setMaxRetentions] = useState(6)
  const [maxRTM, setMaxRTM] = useState(1)

  const handleConfigureRetention = () => {
    updateTeamLimits(maxRetentions, maxRTM)
    startRetentionPhase()
    setShowRetentionConfig(false)
    onRetentionStart()
  }

  const handleSkipRetention = () => {
    // Skip retention and go directly to auction
    completeRetentionPhase()
    startAuction()
    onAuctionStart()
  }

  const handleStartAuction = () => {
    startAuction()
    onAuctionStart()
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Room not found</h1>
          <button onClick={onBack} className="gold-gradient px-6 py-3 rounded-xl font-bold">
            Back to Rooms
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      {/* Room Info */}
      <RoomInfoBar />

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <button
          onClick={onBack}
          className="glass-effect p-3 rounded-xl hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Waiting Room</h1>
        <div className="w-12 h-12" /> {/* Spacer */}
      </motion.div>

      <div className="max-w-4xl mx-auto">
        {/* User Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 rounded-2xl mb-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4">
            {userRole === 'admin' ? (
              <Settings className="w-8 h-8" />
            ) : userRole === 'team' ? (
              <Users className="w-8 h-8" />
            ) : (
              <Trophy className="w-8 h-8" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {userRole === 'admin' ? 'Room Admin' : 
             userRole === 'team' ? `${selectedTeam} Owner` : 
             'Spectator'}
          </h2>
          
          <p className="text-gray-400">
            {userRole === 'admin' ? 'Configure and start the auction' : 
             'Waiting for admin to start the auction'}
          </p>
        </motion.div>

        {/* No Admin Warning */}
        {currentRoom.adminCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-effect p-6 rounded-2xl mb-6 text-center border-2 border-yellow-500/30"
          >
            <Settings className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-yellow-400 mb-2">Admin Needed</h3>
            <p className="text-gray-400">
              This room needs an admin to configure and start the auction. Someone needs to join as admin.
            </p>
          </motion.div>
        )}

        {/* Admin Controls */}
        {userRole === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass-effect p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Auction Configuration</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRetentionConfig(true)}
                  className="glass-effect p-6 rounded-xl hover:bg-white/10 transition-all text-left"
                >
                  <Settings className="w-8 h-8 text-blue-400 mb-3" />
                  <h4 className="text-lg font-bold text-white mb-2">Configure Retention</h4>
                  <p className="text-gray-400 text-sm">Set retention and RTM limits for teams</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSkipRetention}
                  className="glass-effect p-6 rounded-xl hover:bg-white/10 transition-all text-left"
                >
                  <Play className="w-8 h-8 text-green-400 mb-3" />
                  <h4 className="text-lg font-bold text-white mb-2">Start Auction</h4>
                  <p className="text-gray-400 text-sm">Skip retention and start bidding directly</p>
                </motion.button>
              </div>
            </div>

            {/* Retention Configuration Modal */}
            {showRetentionConfig && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="glass-effect p-6 rounded-3xl max-w-md w-full"
                >
                  <h3 className="text-xl font-bold text-white mb-4 text-center">Retention Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Max Retentions per Team
                      </label>
                      <select
                        value={maxRetentions}
                        onChange={(e) => setMaxRetentions(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-400 focus:outline-none"
                      >
                        <option value={3}>3 Retentions</option>
                        <option value={4}>4 Retentions</option>
                        <option value={5}>5 Retentions</option>
                        <option value={6}>6 Retentions</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        RTM Cards per Team
                      </label>
                      <select
                        value={maxRTM}
                        onChange={(e) => setMaxRTM(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-400 focus:outline-none"
                      >
                        <option value={1}>1 RTM Card</option>
                        <option value={2}>2 RTM Cards</option>
                        <option value={3}>3 RTM Cards</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowRetentionConfig(false)}
                      className="flex-1 glass-effect p-3 rounded-xl hover:bg-white/10 font-bold"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConfigureRetention}
                      className="flex-1 gold-gradient p-3 rounded-xl font-bold"
                    >
                      Start Retention
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* Waiting Status for Non-Admins */}
        {userRole !== 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect p-8 rounded-2xl text-center"
          >
            <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Waiting for Admin</h3>
            <p className="text-gray-400 mb-6">
              The room admin is configuring the auction settings. Please wait...
            </p>
            
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200" />
            </div>
          </motion.div>
        )}

        {/* Room Participants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect p-6 rounded-2xl mt-8"
        >
          <h3 className="text-lg font-bold text-white mb-4">Room Participants</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-400">{currentRoom.adminCount}</div>
              <div className="text-sm text-gray-400">Admin</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{currentRoom.teamCount}</div>
              <div className="text-sm text-gray-400">Teams</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">{currentRoom.spectatorCount}</div>
              <div className="text-sm text-gray-400">Spectators</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}