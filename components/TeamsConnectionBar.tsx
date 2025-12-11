'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useAuctionStore } from '@/store/auctionStore'
import { useConnectedClients } from '@/hooks/useConnectedClients'

export default function TeamsConnectionBar() {
  const { teams } = useAuctionStore()
  const { isTeamConnected } = useConnectedClients()

  return (
    <div className="glass-effect p-6 rounded-2xl mb-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-6 overflow-x-auto pb-2 px-2">
          {teams.map((team, index) => {
            const isConnected = isTeamConnected(team.name)
            
            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex-shrink-0"
              >
                {/* Team Card Container */}
                <div 
                  className={`relative p-3 rounded-xl transition-all duration-300 ${
                    isConnected 
                      ? 'bg-white/10 shadow-lg ring-2 ring-green-400/50 backdrop-blur-sm' 
                      : 'bg-white/5 opacity-60'
                  }`}
                >
                  {/* Team Logo */}
                  <div className="relative w-12 h-12 mx-auto mb-2">
                    <div className="w-full h-full bg-white rounded-full p-1.5">
                      <img 
                        src={team.logo} 
                        alt={team.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {/* Connection Status Indicator */}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      isConnected ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      {isConnected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-1.5 h-1.5 bg-white rounded-full"
                        />
                      )}
                    </div>
                  </div>

                  {/* Team Info */}
                  <div className="text-center">
                    <div className={`text-xs font-bold truncate max-w-[80px] ${
                      isConnected ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {team.name.split(' ').map(word => word.charAt(0)).join('')}
                    </div>
                    
                    {/* Budget Display */}
                    <div className={`text-xs font-bold mt-1 ${
                      team.budget > 100 ? 'text-green-400' :
                      team.budget > 50 ? 'text-yellow-400' :
                      team.budget > 20 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      ₹{team.budget.toFixed(1)}Cr
                    </div>
                    
                    {/* Squad Size */}
                    <div className={`text-xs mt-1 ${
                      isConnected ? 'text-blue-400' : 'text-gray-500'
                    }`}>
                      {team.players?.length || 0} players
                    </div>
                  </div>

                  {/* Budget Bar */}
                  <div className="mt-2 w-full bg-gray-600 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-500 ${
                        team.budget > 100 ? 'bg-green-400' :
                        team.budget > 50 ? 'bg-yellow-400' :
                        team.budget > 20 ? 'bg-orange-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.max((team.budget / 125) * 100, 5)}%` }}
                    />
                  </div>
                </div>

                {/* Pulse Animation for Connected Teams */}
                {isConnected && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-green-400/50"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.3, 0, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
      
      {/* Connection Summary */}
      <div className="text-center mt-6">
        <div className="text-sm text-gray-400">
          <span className="text-green-400 font-bold">
            {teams.filter(team => isTeamConnected(team.name)).length}
          </span>
          {' / '}
          <span className="text-gray-300">
            {teams.length}
          </span>
          {' teams connected'}
        </div>
      </div>
    </div>
  )
}