import { io, Socket } from 'socket.io-client'

class SocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(serverUrl?: string) {
    // Auto-detect production URL or use provided URL
    const url = serverUrl || 
                process.env.NEXT_PUBLIC_SOCKET_URL || 
                (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                  ? 'http://localhost:3002' 
                  : `https://${window.location.hostname}:3002`) || 
                'http://localhost:3002'
    
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    this.socket.on('connect', () => {
      console.log('✅ Connected to auction server')
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason)
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error)
      this.handleReconnect()
    })

    return this.socket
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      
      setTimeout(() => {
        this.socket?.connect()
      }, Math.pow(2, this.reconnectAttempts) * 1000) // Exponential backoff
    } else {
      console.error('❌ Max reconnection attempts reached')
    }
  }

  joinRoom(roomId: string, type: 'admin' | 'team' | 'spectator', teamName?: string) {
    this.socket?.emit('join-room', { roomId, type, teamName })
  }

  identify(type: 'admin' | 'team' | 'spectator', teamName?: string) {
    // Legacy method - kept for backward compatibility
    this.socket?.emit('identify', { type, teamName })
  }

  updateAuctionState(state: any) {
    this.socket?.emit('update-auction-state', state)
  }

  triggerAnimation(animationData: any) {
    this.socket?.emit('trigger-animation', animationData)
  }

  placeBid(bidData: any) {
    this.socket?.emit('place-bid', bidData)
  }

  useRTM(rtmData: any) {
    this.socket?.emit('use-rtm', rtmData)
  }

  broadcastTeamAnalysis(analysisData: any) {
    this.socket?.emit('broadcast-team-analysis', analysisData)
  }

  endRoom(roomData: { roomId: string }) {
    this.socket?.emit('end-room', roomData)
  }

  onAuctionStateUpdate(callback: (state: any) => void) {
    this.socket?.on('auction-state', callback)
  }

  onAnimationTrigger(callback: (animationData: any) => void) {
    this.socket?.on('animation-trigger', callback)
  }

  onNewBid(callback: (bid: any) => void) {
    this.socket?.on('new-bid', callback)
  }

  onRTMUsed(callback: (rtmData: any) => void) {
    this.socket?.on('rtm-used', callback)
  }

  onClientsUpdate(callback: (clientsData: any) => void) {
    this.socket?.on('clients-update', callback)
  }

  onTeamAnalysisShow(callback: (analysisData: any) => void) {
    this.socket?.on('show-team-analysis', callback)
  }

  onRoomEnded(callback: (data: { roomId: string; message: string }) => void) {
    this.socket?.on('room-ended', callback)
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

// Export singleton instance
export const socketClient = new SocketClient()
export default socketClient