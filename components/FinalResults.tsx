'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Award, Users, TrendingUp, Star, ArrowLeft } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'

interface FinalResultsProps {
  onBack: () => void
  userTeam?: string | null
  userRole?: 'admin' | 'team' | 'spectator' | null
}

interface TeamScore {
  teamName: string
  logo: string
  color: string
  totalPlayers: number
  battingStrength: number
  bowlingStrength: number
  allRounderStrength: number
  overallScore: number
  rank: number
  strengths: string[]
  weaknesses: string[]
}

export default function FinalResults({ onBack, userTeam, userRole }: FinalResultsProps) {
  const { teams, players } = useAuctionStore()
  const [teamScores, setTeamScores] = useState<TeamScore[]>([])
  const [showAnimation, setShowAnimation] = useState(true)

  // Calculate team scores and rankings
  useEffect(() => {
    const calculateTeamScores = () => {
      const scores: TeamScore[] = teams.map(team => {
        const teamPlayers = team.players.filter(p => p.status === 'sold' || p.status === 'retained')
        
        // Calculate different strength categories
        const batsmen = teamPlayers.filter(p => p.role === 'Batsman' || p.role === 'Wicket-Keeper')
        const bowlers = teamPlayers.filter(p => p.role === 'Bowler')
        const allRounders = teamPlayers.filter(p => p.role === 'All-Rounder')
        
        // Scoring algorithm (simplified)
        const battingStrength = Math.min(100, (batsmen.length * 15) + (allRounders.length * 10))
        const bowlingStrength = Math.min(100, (bowlers.length * 15) + (allRounders.length * 10))
        const allRounderStrength = Math.min(100, allRounders.length * 25)
        
        // Balance bonus
        const balanceBonus = Math.min(20, Math.abs(batsmen.length - bowlers.length) < 2 ? 20 : 0)
        
        // Squad size penalty/bonus
        const squadSizeScore = teamPlayers.length >= 15 ? 20 : (teamPlayers.length * 1.3)
        
        const overallScore = Math.round(
          (battingStrength * 0.3) + 
          (bowlingStrength * 0.3) + 
          (allRounderStrength * 0.2) + 
          balanceBonus + 
          squadSizeScore
        )

        // Determine strengths and weaknesses
        const strengths: string[] = []
        const weaknesses: string[] = []

        if (battingStrength >= 70) strengths.push('Strong Batting Lineup')
        else if (battingStrength < 40) weaknesses.push('Weak Batting')

        if (bowlingStrength >= 70) strengths.push('Solid Bowling Attack')
        else if (bowlingStrength < 40) weaknesses.push('Bowling Concerns')

        if (allRounderStrength >= 50) strengths.push('Good All-Round Balance')
        else if (allRounderStrength < 20) weaknesses.push('Lack of All-Rounders')

        if (teamPlayers.length >= 18) strengths.push('Deep Squad')
        else if (teamPlayers.length < 12) weaknesses.push('Thin Squad')

        return {
          teamName: team.name,
          logo: team.logo,
          color: team.color,
          totalPlayers: teamPlayers.length,
          battingStrength,
          bowlingStrength,
          allRounderStrength,
          overallScore,
          rank: 0, // Will be set after sorting
          strengths,
          weaknesses
        }
      })

      // Sort by overall score and assign ranks
      scores.sort((a, b) => b.overallScore - a.overallScore)
      scores.forEach((score, index) => {
        score.rank = index + 1
      })

      return scores
    }

    setTeamScores(calculateTeamScores())
    
    // Hide animation after 3 seconds
    setTimeout(() => setShowAnimation(false), 3000)
  }, [teams, players])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-8 h-8 text-yellow-400" />
      case 2: return <Medal className="w-8 h-8 text-gray-300" />
      case 3: return <Award className="w-8 h-8 text-amber-600" />
      default: return <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">{rank}</div>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600'
      case 2: return 'from-gray-300 to-gray-500'
      case 3: return 'from-amber-500 to-amber-700'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  const userTeamScore = teamScores.find(score => score.teamName === userTeam)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      {/* Animation Overlay */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-8xl mb-6"
              >
                🏆
              </motion.div>
              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-gold-600 bg-clip-text text-transparent mb-4"
              >
                AUCTION COMPLETE!
              </motion.h1>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-2xl text-gray-300"
              >
                Analyzing team performances...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          Back to Rooms
        </button>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-gold-600 bg-clip-text text-transparent">
          Final Results & Rankings
        </h1>
        <div className="w-32" /> {/* Spacer */}
      </motion.div>

      {/* User Team Highlight (if user is a team owner) */}
      {userRole === 'team' && userTeamScore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div 
            className="glass-effect p-8 rounded-3xl border-4 relative overflow-hidden"
            style={{
              borderColor: userTeamScore.color,
              boxShadow: `0 0 40px ${userTeamScore.color}40`
            }}
          >
            <div className="absolute inset-0 opacity-10" style={{ background: userTeamScore.color }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <img src={userTeamScore.logo} alt={userTeamScore.teamName} className="w-20 h-20 object-contain" />
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">YOUR TEAM RESULT</h2>
                    <h3 className="text-2xl font-bold" style={{ color: userTeamScore.color }}>
                      {userTeamScore.teamName}
                    </h3>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getRankIcon(userTeamScore.rank)}
                  </div>
                  <div className="text-4xl font-bold text-white">#{userTeamScore.rank}</div>
                  <div className="text-lg text-gray-300">Rank</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{userTeamScore.overallScore}</div>
                  <div className="text-sm text-gray-400">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{userTeamScore.battingStrength}</div>
                  <div className="text-sm text-gray-400">Batting</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">{userTeamScore.bowlingStrength}</div>
                  <div className="text-sm text-gray-400">Bowling</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{userTeamScore.allRounderStrength}</div>
                  <div className="text-sm text-gray-400">All-Round</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Strengths
                  </h4>
                  <div className="space-y-2">
                    {userTeamScore.strengths.map((strength, idx) => (
                      <div key={idx} className="bg-green-500/20 text-green-300 px-3 py-2 rounded-lg text-sm">
                        ✓ {strength}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Areas to Improve
                  </h4>
                  <div className="space-y-2">
                    {userTeamScore.weaknesses.map((weakness, idx) => (
                      <div key={idx} className="bg-orange-500/20 text-orange-300 px-3 py-2 rounded-lg text-sm">
                        ⚠ {weakness}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Overall Rankings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect p-8 rounded-3xl"
      >
        <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          Team Rankings
        </h2>

        <div className="space-y-4">
          {teamScores.map((score, idx) => (
            <motion.div
              key={score.teamName}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-2xl border-2 transition-all ${
                score.teamName === userTeam 
                  ? 'border-yellow-400 bg-yellow-400/10' 
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    {getRankIcon(score.rank)}
                    <img src={score.logo} alt={score.teamName} className="w-12 h-12 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: score.color }}>
                      {score.teamName}
                    </h3>
                    <div className="text-sm text-gray-400">
                      {score.totalPlayers} players
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{score.overallScore}</div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{score.battingStrength}</div>
                    <div className="text-xs text-gray-400">BAT</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">{score.bowlingStrength}</div>
                    <div className="text-xs text-gray-400">BOWL</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">{score.allRounderStrength}</div>
                    <div className="text-xs text-gray-400">AR</div>
                  </div>
                </div>
              </div>

              {/* Show detailed breakdown for top 3 teams */}
              {score.rank <= 3 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-400">Strengths: </span>
                      <span className="text-gray-300">{score.strengths.join(', ') || 'Balanced team'}</span>
                    </div>
                    <div>
                      <span className="text-orange-400">Focus Areas: </span>
                      <span className="text-gray-300">{score.weaknesses.join(', ') || 'Well-rounded squad'}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-8 text-gray-400"
      >
        <p className="text-lg">
          🎉 Thank you for participating in the auction! 
          {userRole === 'team' && userTeamScore && (
            <span className="block mt-2 text-xl font-bold" style={{ color: userTeamScore.color }}>
              {userTeamScore.rank === 1 ? '🏆 Congratulations on building the best team!' :
               userTeamScore.rank <= 3 ? '🥉 Great job on making the top 3!' :
               '💪 Keep building and come back stronger!'}
            </span>
          )}
        </p>
      </motion.div>
    </div>
  )
}