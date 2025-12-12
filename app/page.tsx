'use client'

import { useState, useEffect } from 'react'
import AuctionRoom from '@/components/AuctionRoom'
import AdminPanel from '@/components/AdminPanel'
import LandingPage from '@/components/LandingPage'
import RoomSelectionPage from '@/components/RoomSelectionPage'
import RetentionPhase from '@/components/RetentionPhase'
import TeamWelcomeIntro from '@/components/TeamWelcomeIntro'
import FirstTimeIntro from '@/components/FirstTimeIntro'
import WaitingRoom from '@/components/WaitingRoom'
import FinalResults from '@/components/FinalResults'
import GlobalUIComponents from '@/components/GlobalUIComponents'
import { useAuctionStore } from '@/store/auctionStore'
import { useRoomStore } from '@/store/roomStore'

export default function Home() {
  const [view, setView] = useState<'landing' | 'rooms' | 'auction' | 'admin' | 'spectator' | 'retention' | 'video' | 'waiting' | 'results'>('landing')
  const [userRole, setUserRole] = useState<'admin' | 'team' | 'spectator' | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [showVideoIntro, setShowVideoIntro] = useState(false)
  const [showFirstTimeIntro, setShowFirstTimeIntro] = useState(false)
  const { retentionPhaseActive, limitsConfigured } = useAuctionStore()
  const { currentRoom } = useRoomStore()

  // Check if this is the first time visiting
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('ipl-auction-intro-seen')
    if (!hasSeenIntro) {
      setShowFirstTimeIntro(true)
    }
  }, [])

  const handleEnter = (role: 'bidder' | 'admin' | 'spectator', teamName?: string) => {
    // First, go to room selection
    setView('rooms')
  }

  const handleRoomJoined = (roomId: string) => {
    // After joining a room, show role selection within the room
    setView('auction')
  }

  const handleRoleSelected = (role: 'admin' | 'team' | 'spectator', teamName?: string) => {
    setUserRole(role)
    
    if (role === 'team' && teamName) {
      setSelectedTeam(teamName)
      // Show team intro video first
      setShowVideoIntro(true)
      setView('video')
    } else if (role === 'admin') {
      // Admin goes to admin panel
      setView('admin')
    } else {
      // Spectators wait for auction to start
      setView('waiting')
    }
  }

  const handleVideoComplete = () => {
    setShowVideoIntro(false)
    // After video, teams wait for admin to configure retention or start auction
    setView('waiting')
  }

  const handleFirstTimeIntroComplete = () => {
    setShowFirstTimeIntro(false)
  }

  if (view === 'landing') {
    return (
      <>
        <LandingPage onEnter={handleEnter} />
        <FirstTimeIntro 
          show={showFirstTimeIntro} 
          onComplete={handleFirstTimeIntroComplete} 
        />
        <GlobalUIComponents />
      </>
    )
  }

  if (view === 'rooms') {
    return (
      <>
        <RoomSelectionPage onRoomJoined={handleRoomJoined} />
        <GlobalUIComponents />
      </>
    )
  }

  if (view === 'admin') {
    return (
      <>
        <AdminPanel onBack={() => setView('landing')} />
        <GlobalUIComponents />
      </>
    )
  }

  if (view === 'retention') {
    return (
      <>
        <RetentionPhase 
          onBack={() => setView('landing')} 
          userRole={userRole === 'admin' ? 'admin' : 'team'}
          userTeam={selectedTeam || undefined}
        />
        <GlobalUIComponents />
      </>
    )
  }

  if (view === 'video') {
    return (
      <>
        <TeamWelcomeIntro
          teamName={selectedTeam || ''}
          onComplete={handleVideoComplete}
          show={showVideoIntro}
        />
        <GlobalUIComponents />
      </>
    )
  }

  if (view === 'waiting') {
    return (
      <>
        <WaitingRoom 
          userRole={userRole}
          selectedTeam={selectedTeam}
          onRetentionStart={() => setView('retention')}
          onAuctionStart={() => setView('auction')}
          onBack={() => setView('rooms')}
        />
        <GlobalUIComponents />
      </>
    )
  }

  if (view === 'spectator') {
    return (
      <>
        <AuctionRoom onBack={() => setView('rooms')} selectedTeam={null} isSpectator={true} />
        <GlobalUIComponents />
      </>
    )
  }

  if (view === 'results') {
    return (
      <>
        <FinalResults 
          onBack={() => setView('rooms')} 
          userTeam={selectedTeam}
          userRole={userRole}
        />
        <GlobalUIComponents />
      </>
    )
  }

  return (
    <>
      <AuctionRoom 
        onBack={() => setView('rooms')} 
        selectedTeam={selectedTeam} 
        isSpectator={userRole === 'spectator'}
        onRoleSelect={handleRoleSelected}
      />
      
      {/* Team Welcome Intro */}
      <TeamWelcomeIntro
        teamName={selectedTeam || ''}
        onComplete={handleVideoComplete}
        show={showVideoIntro}
      />
      
      {/* Global UI Components */}
      <GlobalUIComponents />
    </>
  )
}
