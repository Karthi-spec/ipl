import { useEffect } from 'react'
import { useConnectionStore } from '@/store/connectionStore'

export function useConnectedClients() {
  const {
    connectedClients,
    getStats,
    getConnectedTeams,
    isTeamConnected,
    updateClientActivity
  } = useConnectionStore()

  const stats = getStats()

  // Update client activity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      connectedClients.forEach(client => {
        if (client.isActive) {
          updateClientActivity(client.id)
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [connectedClients, updateClientActivity])

  const getTeamByName = (teamName: string) => {
    return connectedClients.find(client => client.type === 'team' && client.teamName === teamName)
  }

  return {
    clients: connectedClients,
    stats,
    getConnectedTeams,
    getTeamByName,
    isTeamConnected
  }
}