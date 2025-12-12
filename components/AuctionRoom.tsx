'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, TrendingUp, Users, Eye, X } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { useRoomStore } from '@/store/roomStore'
import PlayerCard from './PlayerCard'
import BiddingPanel from './BiddingPanel'
import TeamsList from './TeamsList'
import SoldAnimation from './SoldAnimation'
import RTMModal from './RTMModal'
import RTMAnimation from './RTMAnimation'
import RetainedAnimation from './RetainedAnimation'
import UnsoldAnimation from './UnsoldAnimation'
import SquadManager from './SquadManager'
import TeamsConnectionBar from './TeamsConnectionBar'
import TeamAnalysisDisplay from './TeamAnalysisDisplay'
import AuctionTimer from './AuctionTimer'
import UserConnectionStatus from './UserConnectionStatus'
import RoomTeamSelectionModal from './RoomTeamSelectionModal'
import RoomInfoBar from './RoomInfoBar'
import { socketClient } from '@/utils/socketClient'
import { getPlayerRating } from '@/utils/playerRatings'


interface AuctionRoomProps {
  onBack: () => void
  selectedTeam?: string | null
  isSpectator?: boolean
  onRoleSelect?: (role: 'admin' | 'team' | 'spectator', teamName?: string) => void
}

export default function AuctionRoom({ onBack, selectedTeam: userSelectedTeam, isSpectator = false, onRoleSelect }: AuctionRoomProps) {
  const { 
    currentPlayer, 
    teams, 
    bids, 
    showRTMAnimation,
    rtmAnimationData,
    setShowRTMAnimation,
    showSoldAnimation,
    soldAnimationData,
    setShowSoldAnimation,
    showRetainedAnimation,
    retainedAnimationData,
    setShowRetainedAnimation,
    showUnsoldAnimation,
    unsoldAnimationData,
    setShowUnsoldAnimation,
    limitsConfigured,
    retentionPhaseActive,
    retentionPhaseComplete
  } = useAuctionStore()
  const { currentRoom } = useRoomStore()
  const [selectedTeam, setSelectedTeam] = useState<string>(userSelectedTeam || '')
  const [userRole, setUserRole] = useState<'admin' | 'team' | 'spectator' | null>(null)
  const [showRoleSelection, setShowRoleSelection] = useState<boolean>(!userSelectedTeam && !isSpectator)
  const [showSquadManager, setShowSquadManager] = useState<boolean>(false)
  const [showTeamAnalysis, setShowTeamAnalysis] = useState<boolean>(false)

  const handleRoleSelect = async (role: 'admin' | 'team' | 'spectator', teamName?: string) => {
    const { joinRoomWithRole, currentRoom } = useRoomStore.getState()
    
    if (!currentRoom) return
    
    try {
      const result = await joinRoomWithRole(currentRoom.id, role)
      
      // Use the actual role returned (in case admin was converted to spectator)
      setUserRole(result.actualRole)
      setShowRoleSelection(false)
      
      // Show message if role was changed
      if (role === 'admin' && result.actualRole === 'spectator') {
        alert('Admin slot was already taken - you have joined as a spectator instead')
      }
      
      // Call parent handler to navigate to appropriate view
      if (onRoleSelect) {
        onRoleSelect(result.actualRole, teamName)
      }
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to join with selected role')
    }
  }
  const [teamAnalysisData, setTeamAnalysisData] = useState<any[]>([])

  // Lock team selection if user joined as specific team
  useEffect(() => {
    if (userSelectedTeam) {
      setSelectedTeam(userSelectedTeam)
    }
  }, [userSelectedTeam])



  // Handle ESC key to close squad manager
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSquadManager) {
        setShowSquadManager(false)
      }
      if (event.key === 'Escape' && showTeamAnalysis) {
        setShowTeamAnalysis(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showSquadManager, showTeamAnalysis])

  // Listen for team analysis broadcast
  useEffect(() => {
    const handleTeamAnalysis = (analysisData: any[]) => {
      setTeamAnalysisData(analysisData)
      setShowTeamAnalysis(true)
    }

    socketClient.onTeamAnalysisShow(handleTeamAnalysis)

    return () => {
      // Clean up listener
      const socket = socketClient.getSocket()
      if (socket) {
        socket.off('show-team-analysis', handleTeamAnalysis)
      }
    }
  }, [])



  // Animations are now handled automatically by the animation manager

  return (
    <>
      {/* RTM Modal */}
      <RTMModal />

      {/* All Animations - Synced with Admin Actions */}
      <SoldAnimation
        show={showSoldAnimation}
        team={soldAnimationData?.team || null}
        playerName={soldAnimationData?.playerName || ''}
        amount={soldAnimationData?.amount || 0}
        onComplete={() => {}}
      />

      <RTMAnimation
        show={showRTMAnimation}
        team={rtmAnimationData?.team || null}
        playerName={rtmAnimationData?.playerName || ''}
        amount={rtmAnimationData?.amount || 0}
        onComplete={() => {}}
      />

      <RetainedAnimation
        show={showRetainedAnimation}
        team={retainedAnimationData?.team || null}
        playerName={retainedAnimationData?.playerName || ''}
        amount={retainedAnimationData?.amount || 0}
        onComplete={() => {}}
      />

      <UnsoldAnimation
        show={showUnsoldAnimation}
        playerName={unsoldAnimationData?.playerName || ''}
        onComplete={() => {}}
      />

      {/* Team Analysis Display */}
      <TeamAnalysisDisplay
        isVisible={showTeamAnalysis}
        analysisData={teamAnalysisData}
        onClose={() => setShowTeamAnalysis(false)}
      />

      <div className="min-h-screen p-4 md:p-8">
      {/* Room Info Bar */}
      <RoomInfoBar />

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <button
          onClick={onBack}
          className="glass-effect px-6 py-3 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Exit
        </button>

        <div className="flex items-center gap-6">
          {selectedTeam && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSquadManager(true)}
              className="glass-effect px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all border border-blue-500/30"
            >
              {(() => {
                const team = teams.find(t => t.name === selectedTeam)
                const squadSize = team?.players?.length || 0
                return (
                  <>
                    {team ? (
                      <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <Users className="w-5 h-5 text-blue-400" />
                    )}
                    <div className="text-left">
                      <div className="font-bold text-blue-400 flex items-center gap-2">
                        Squad Management
                        {squadSize > 0 && (
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                            {squadSize}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{selectedTeam}</div>
                    </div>
                  </>
                )
              })()}
            </motion.button>
          )}
          <div className="glass-effect px-6 py-3 rounded-xl flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="font-bold">{teams.length} Teams</span>
          </div>
        </div>
      </motion.div>

      {/* Teams Connection Bar */}
      <TeamsConnectionBar />

      {/* Squad Management Modal */}
      <AnimatePresence>
        {showSquadManager && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowSquadManager(false)
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="max-w-7xl mx-auto py-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  {(() => {
                    const team = teams.find(t => t.name === selectedTeam)
                    return team && (
                      <img src={team.logo} alt={team.name} className="w-12 h-12 object-contain" />
                    )
                  })()}
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                      Squad Management
                    </h1>
                    <p className="text-gray-400">{selectedTeam}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-400">Press ESC to close</div>
                  <button
                    onClick={() => setShowSquadManager(false)}
                    className="glass-effect p-3 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <SquadManager teamName={selectedTeam} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Auction Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Player */}
          <AnimatePresence mode="wait">
            {currentPlayer && (
              <PlayerCard player={currentPlayer} />
            )}
          </AnimatePresence>

          {/* Bidding Panel - Hidden for Spectators */}
          {!isSpectator && (
            <>
              {!limitsConfigured ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect p-6 rounded-2xl border-2 border-yellow-500/50 text-center"
                >
                  <div className="animate-pulse text-yellow-400 mb-2 text-2xl">⏳</div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Waiting for Admin</h3>
                  <p className="text-gray-300 mb-2">
                    The admin is configuring the auction settings...
                  </p>
                  <p className="text-sm text-gray-400">
                    You'll be able to bid once the auction starts!
                  </p>
                </motion.div>
              ) : (
                <BiddingPanel
                  selectedTeam={selectedTeam}
                  onTeamSelect={setSelectedTeam}
                  isTeamLocked={!!userSelectedTeam}
                />
              )}
            </>
          )}

          {/* Spectator Notice */}
          {isSpectator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect p-6 rounded-2xl border-2 border-purple-500/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <Eye className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-purple-400">Spectator Mode</h3>
              </div>
              {!limitsConfigured ? (
                <div className="text-center py-4">
                  <div className="animate-pulse text-yellow-400 mb-2">⏳</div>
                  <p className="text-gray-300 mb-2">
                    Waiting for admin to configure the auction...
                  </p>
                  <p className="text-sm text-gray-400">
                    The admin needs to set up retention rules or start the auction directly.
                  </p>
                </div>
              ) : (
                <p className="text-gray-300">
                  You're watching the auction live. You can see all bidding activity but cannot place bids.
                </p>
              )}
            </motion.div>
          )}

          {/* Recent Bids */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-effect p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gold-400" />
              <h3 className="text-xl font-bold">Live Bidding Activity</h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bids.slice(0, 10).map((bid, idx) => {
                const team = teams.find(t => t.name === bid.teamName)
                return (
                  <motion.div
                    key={bid.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {team && <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />}
                      </div>
                      <div>
                        <div className="font-semibold">{bid.teamName}</div>
                        <div className="text-sm text-gray-400">{bid.playerName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gold-400">
                        ₹{bid.amount.toFixed(2)}Cr
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(bid.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Teams Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Auction Timer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AuctionTimer isAdmin={false} />
          </motion.div>

          <TeamsList />
        </div>
      </div>
    </div>



    {/* User Connection Status */}
    <UserConnectionStatus />

    {/* Room Role Selection Modal */}
    {showRoleSelection && (
      <RoomTeamSelectionModal
        onRoleSelect={handleRoleSelect}
        onClose={() => setShowRoleSelection(false)}
      />
    )}

    </>
  )
}
