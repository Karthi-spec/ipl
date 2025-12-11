'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, RotateCcw, Eye, EyeOff, Calendar } from 'lucide-react'
import { TeamIntroTracker } from '@/utils/teamIntroTracker'

export default function TeamIntroDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const [debugInfo, setDebugInfo] = useState<{ [teamName: string]: { shown: boolean; timestamp: Date | null } }>({})

  const refreshDebugInfo = () => {
    setDebugInfo(TeamIntroTracker.getDebugInfo())
  }

  useEffect(() => {
    if (isVisible) {
      refreshDebugInfo()
    }
  }, [isVisible])

  const handleResetTeam = (teamName: string) => {
    TeamIntroTracker.resetIntroStatus(teamName)
    refreshDebugInfo()
  }

  const handleResetAll = () => {
    TeamIntroTracker.resetAllIntroStatuses()
    refreshDebugInfo()
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg"
        title="Team Intro Debug Panel"
      >
        <Settings className="w-6 h-6" />
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-4 top-4 bottom-4 w-80 bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl p-6 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">🎬 Team Intro Debug</h2>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Reset All Button */}
      <button
        onClick={handleResetAll}
        className="w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg font-bold mb-6 flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Reset All Teams
      </button>

      {/* Team Status List */}
      <div className="space-y-3">
        <h3 className="text-white font-bold mb-3">Team Intro Status</h3>
        {Object.entries(debugInfo).map(([teamName, info]) => (
          <div
            key={teamName}
            className="bg-gray-800 p-3 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium text-sm">{teamName}</span>
              <div className="flex items-center gap-2">
                {info.shown ? (
                  <Eye className="w-4 h-4 text-green-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
                <button
                  onClick={() => handleResetTeam(teamName)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div className="text-xs text-gray-400">
              Status: <span className={info.shown ? 'text-green-400' : 'text-yellow-400'}>
                {info.shown ? 'Intro Shown' : 'First Time'}
              </span>
            </div>
            
            {info.timestamp && (
              <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                {info.timestamp.toLocaleDateString()} {info.timestamp.toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-3 bg-blue-900/50 rounded-lg border border-blue-500/30">
        <h4 className="text-blue-300 font-bold text-sm mb-2">How it works:</h4>
        <ul className="text-xs text-blue-200 space-y-1">
          <li>• First time: Shows welcome animation + video</li>
          <li>• Return visits: Shows video only</li>
          <li>• Each team tracked separately</li>
          <li>• Reset to test welcome animation again</li>
        </ul>
      </div>

      {/* Stats */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg">
        <div className="text-xs text-gray-400">
          Teams with intro shown: <span className="text-white font-bold">
            {Object.values(debugInfo).filter(info => info.shown).length}/10
          </span>
        </div>
      </div>
    </motion.div>
  )
}