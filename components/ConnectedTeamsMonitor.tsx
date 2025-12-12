'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Users, Wifi, WifiOff, Eye, Shield, Clock } from 'lucide-react'
import { useConnectedClients } from '@/hooks/useConnectedClients'
import { getTeamLogo as getTeamLogoPath } from '@/utils/imagePaths'

interface ConnectedTeamsMonitorProps {
  show: boolean
  onClose: () => void
}

export default function ConnectedTeamsMonitor({ show, onClose }: ConnectedTeamsMonitorProps) {
  const { clients: connectedClients, stats } = useConnectedClients()

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const getClientIcon = (client: any) => {
    if (client.type === 'team' && client.teamName && getTeamLogoPath(client.teamName)) {
      return (
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border-2" style={{ borderColor: getTeamColor(client.teamName) }}>
          <img 
            src={getTeamLogoPath(client.teamName)!} 
            alt={client.teamName} 
            className="w-6 h-6 object-contain"
          />
        </div>
      )
    }
    
    switch (client.type) {
      case 'admin': return <Shield className="w-5 h-5 text-red-400" />
      case 'team': return <Users className="w-5 h-5 text-blue-400" />
      case 'spectator': return <Eye className="w-5 h-5 text-gray-400" />
      default: return <Users className="w-5 h-5" />
    }
  }

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



  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4">
      <div className="max-w-6xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-8 rounded-3xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Wifi className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Connected Teams & Users</h1>
                <p className="text-gray-400">Real-time monitoring of auction participants</p>
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Debug: {connectedClients.length} clients tracked
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="glass-effect p-3 rounded-xl hover:bg-white/10 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-effect p-6 rounded-2xl text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Connected</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-effect p-6 rounded-2xl text-center border-2 border-blue-500/30"
            >
              <div className="text-3xl font-bold text-blue-400 mb-2">{stats.teams}</div>
              <div className="text-sm text-gray-400">Teams Joined</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-effect p-6 rounded-2xl text-center border-2 border-red-500/30"
            >
              <div className="text-3xl font-bold text-red-400 mb-2">{stats.admins}</div>
              <div className="text-sm text-gray-400">Admins</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-effect p-6 rounded-2xl text-center border-2 border-gray-500/30"
            >
              <div className="text-3xl font-bold text-gray-400 mb-2">{stats.spectators}</div>
              <div className="text-sm text-gray-400">Spectators</div>
            </motion.div>
          </div>

          {/* Connected Teams Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              Connected Teams
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedClients
                .filter(client => client.type === 'team')
                .map((client, idx) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-effect p-6 rounded-2xl border-2"
                    style={{ borderColor: `${getTeamColor(client.teamName)}40` }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white"
                        style={{ 
                          border: `2px solid ${getTeamColor(client.teamName)}`
                        }}
                      >
                        {getTeamLogoPath(client.teamName) ? (
                          <img 
                            src={getTeamLogoPath(client.teamName)!} 
                            alt={client.teamName} 
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <Users className="w-6 h-6" style={{ color: getTeamColor(client.teamName) }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div 
                          className="text-lg font-bold"
                          style={{ color: getTeamColor(client.teamName) }}
                        >
                          {client.teamName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <div className={`w-2 h-2 rounded-full ${client.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                          {client.isActive ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Joined:</span>
                        <span className="text-white">{formatTimeAgo(client.joinedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Seen:</span>
                        <span className="text-white">{formatTimeAgo(client.lastSeen)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>

            {connectedClients.filter(c => c.type === 'team').length === 0 && (
              <div className="text-center py-12">
                <WifiOff className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No Teams Connected</h3>
                <p className="text-gray-500">Teams will appear here when they join the auction</p>
              </div>
            )}
          </div>

          {/* All Connected Users */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Wifi className="w-6 h-6 text-green-400" />
              All Connected Users
            </h2>
            
            <div className="space-y-3">
              {connectedClients.map((client, idx) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-effect p-4 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {getClientIcon(client)}
                    <div>
                      <div className="font-semibold text-white">
                        {client.teamName || `${client.type.charAt(0).toUpperCase() + client.type.slice(1)} User`}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${client.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                        {client.type.charAt(0).toUpperCase() + client.type.slice(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm">
                    <div className="text-white flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatTimeAgo(client.joinedAt)}
                    </div>
                    <div className="text-gray-400">
                      Last: {formatTimeAgo(client.lastSeen)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Auto-refresh indicator */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
              />
              Auto-refreshing every 5 seconds
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}