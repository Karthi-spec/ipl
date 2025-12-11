'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Wifi, Users, Shield, Eye } from 'lucide-react'
import { useConnectionStore } from '@/store/connectionStore'

export default function UserConnectionStatus() {
  const { currentUserType, currentUserTeam } = useConnectionStore()

  if (!currentUserType) return null

  const getStatusInfo = () => {
    switch (currentUserType) {
      case 'admin':
        return {
          icon: <Shield className="w-4 h-4" />,
          label: 'Admin',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50'
        }
      case 'team':
        return {
          icon: <Users className="w-4 h-4" />,
          label: currentUserTeam || 'Team',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/50'
        }
      case 'spectator':
        return {
          icon: <Eye className="w-4 h-4" />,
          label: 'Spectator',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/50'
        }
      default:
        return null
    }
  }

  const statusInfo = getStatusInfo()
  if (!statusInfo) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed bottom-4 left-4 z-40 glass-effect px-4 py-2 rounded-xl border-2 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
          <Wifi className="w-4 h-4 text-green-400" />
        </div>
        
        <div className="flex items-center gap-2">
          {statusInfo.icon}
          <span className={`text-sm font-bold ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        
        <div className="text-xs text-gray-400">
          Connected
        </div>
      </div>
    </motion.div>
  )
}