'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Wifi } from 'lucide-react'
import { useConnectedClients } from '@/hooks/useConnectedClients'

export default function ConnectedTeamsList() {
  const { getConnectedTeams, stats } = useConnectedClients()
  const connectedTeams = getConnectedTeams()

  const getTeamColor = (teamName?: string) => {
    const teamColors: { [key: string]: string } = {
      'Mumbai Indians': '#004BA0',
      'Chennai Super Kings': '#FDB913',
      'Royal Challengers Bangalore': '#EC1C24',
      'Kolkata Knight Riders': '#6A4A9E',
      'Delhi Capitals': '#004C93',
      'Punjab Kings': '#DD1F2D',
      'Rajasthan Royals': '#254AA5',
      'Sunrisers Hyderabad': '#FF822A',
      'Gujarat Titans': '#4A90E2',
      'Lucknow Super Giants': '#0E7BC6'
    }
    return teamColors[teamName || ''] || '#6B7280'
  }

  const getTeamLogo = (teamName?: string) => {
    const teamLogos: { [key: string]: string } = {
      'Mumbai Indians': '/logos/Original Mumbai Indians PNG-SVG File Download Free Download.png',
      'Chennai Super Kings': '/logos/Original Chennai Super Fun Logo PNG - SVG File Download Free Download.png',
      'Royal Challengers Bangalore': '/logos/rcb-logo-png_seeklogo-531612.png',
      'Kolkata Knight Riders': '/logos/Original Kolkata Knight Riders PNG-SVG File Download Free Download.png',
      'Delhi Capitals': '/logos/delhi-capitals.png',
      'Punjab Kings': '/logos/Original Punjab Kings PNG-SVG File Download Free Download.png',
      'Rajasthan Royals': '/logos/Original Rajasthan Royals Logo PNG-SVG File Download Free Download.png',
      'Sunrisers Hyderabad': '/logos/Original Sunrisers Hyderabad PNG-SVG File Download Free Download.png',
      'Gujarat Titans': '/logos/Original Gujarat Titans Logo PNG-SVG File Download Free Download.png',
      'Lucknow Super Giants': '/logos/Original Lucknow Super Giants PNG-SVG File Download Free Download.png'
    }
    return teamLogos[teamName || ''] || null
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-effect p-4 rounded-xl border-2 border-blue-500/30 bg-blue-500/10"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-400 rounded-full"
            />
            <Wifi className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-blue-400">
              {stats.teams} {stats.teams === 1 ? 'Team' : 'Teams'} Joined
            </span>
          </div>
        </div>

        {/* Teams List */}
        <div className="space-y-2">
          <AnimatePresence>
            {connectedTeams.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                <div className="text-gray-400 text-sm">No teams connected yet</div>
                <div className="text-xs text-gray-500 mt-1">Waiting for teams to join...</div>
              </motion.div>
            ) : (
              connectedTeams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                >
                  {/* Team Logo */}
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-white border-2"
                    style={{ borderColor: getTeamColor(team.teamName) }}
                  >
                    {getTeamLogo(team.teamName) ? (
                      <img 
                        src={getTeamLogo(team.teamName)!} 
                        alt={team.teamName} 
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <Users className="w-4 h-4" style={{ color: getTeamColor(team.teamName) }} />
                    )}
                  </div>

                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-sm font-bold truncate"
                      style={{ color: getTeamColor(team.teamName) }}
                    >
                      {team.teamName}
                    </div>
                    <div className="text-xs text-gray-400">
                      Joined {Math.floor((Date.now() - team.joinedAt.getTime()) / 60000)}m ago
                    </div>
                  </div>

                  {/* Online Status */}
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {connectedTeams.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-xs text-gray-400 text-center">
              Ready to start auction
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}