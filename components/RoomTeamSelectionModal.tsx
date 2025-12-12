'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Shield, Eye, X } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { useRoomStore } from '@/store/roomStore'
import { getImagePath } from '@/utils/imagePaths'

interface RoomTeamSelectionModalProps {
  onRoleSelect: (role: 'admin' | 'team' | 'spectator', teamName?: string) => void
  onClose: () => void
}

export default function RoomTeamSelectionModal({ onRoleSelect, onClose }: RoomTeamSelectionModalProps) {
  const { teams } = useAuctionStore()
  const { currentRoom } = useRoomStore()
  const [selectedRole, setSelectedRole] = useState<'admin' | 'team' | 'spectator' | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string>('')

  const handleRoleSelect = (role: 'admin' | 'team' | 'spectator') => {
    // Only check team limit in UI - admin limit will be handled by the backend
    if (role === 'team' && currentRoom && currentRoom.teamCount >= 10) {
      alert('All team slots are taken (10 teams maximum)')
      return
    }
    
    setSelectedRole(role)
    if (role !== 'team') {
      onRoleSelect(role)
    }
  }

  const handleTeamSelect = (teamName: string) => {
    setSelectedTeam(teamName)
  }

  const handleJoinAuction = () => {
    if (selectedRole === 'team' && selectedTeam) {
      onRoleSelect('team', selectedTeam)
    }
  }

  if (!currentRoom) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-effect p-8 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Join {currentRoom.name}</h1>
            <p className="text-gray-400">Choose your role in this auction</p>
          </div>
          <button
            onClick={onClose}
            className="glass-effect p-3 rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Role Selection */}
        {!selectedRole && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelect('admin')}
              className="glass-effect p-8 rounded-2xl hover:bg-white/10 transition-all group text-center"
            >
              <Shield className="w-12 h-12 text-red-400 mb-4 mx-auto group-hover:animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Admin</h3>
              <p className="text-gray-400">Control the auction, manage players and settings</p>
              {currentRoom?.adminCount >= 1 && (
                <div className="text-orange-400 text-sm mt-2 font-bold">Admin slot taken - you'll join as spectator</div>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelect('team')}
              disabled={currentRoom?.teamCount >= 10}
              className={`glass-effect p-8 rounded-2xl transition-all group text-center ${
                currentRoom?.teamCount >= 10 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-white/10'
              }`}
            >
              <Users className="w-12 h-12 text-gold-400 mb-4 mx-auto group-hover:animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Team Owner</h3>
              <p className="text-gray-400">Select your team and bid for players</p>
              <div className="text-blue-400 text-sm mt-2">
                {currentRoom?.teamCount || 0}/10 slots taken
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelect('spectator')}
              className="glass-effect p-8 rounded-2xl hover:bg-white/10 transition-all group text-center"
            >
              <Eye className="w-12 h-12 text-purple-400 mb-4 mx-auto group-hover:animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Spectator</h3>
              <p className="text-gray-400">Watch the auction live without bidding</p>
            </motion.button>
          </div>
        )}

        {/* Team Selection */}
        {selectedRole === 'team' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Select Your Team</h2>
              <p className="text-gray-400">Choose which IPL team you want to represent</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {teams.map((team) => {
                const isSelected = selectedTeam === team.name
                
                return (
                  <motion.button
                    key={team.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTeamSelect(team.name)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-gold-400 bg-gold-500/20'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                    style={{
                      borderColor: isSelected ? '#FFD700' : team.color,
                      background: isSelected
                        ? 'rgba(255, 215, 0, 0.2)'
                        : `${team.color}20`,
                    }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <img src={getImagePath(team.logo)} alt={team.name} className="w-16 h-16 object-contain" />
                      <div className="font-bold text-lg">{team.name}</div>
                      {isSelected && (
                        <div className="text-xs text-gold-400 font-bold">SELECTED</div>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRole(null)}
                className="flex-1 glass-effect p-4 rounded-xl hover:bg-white/10 font-bold"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoinAuction}
                disabled={!selectedTeam}
                className="flex-1 gold-gradient p-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join as {selectedTeam || 'Team'}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}