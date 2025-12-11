// Team Intro Tracker Utility
// Manages first-time visit tracking for team welcome animations

export class TeamIntroTracker {
  private static readonly STORAGE_PREFIX = 'ipl-auction-team-intro-'
  
  /**
   * Check if intro has been shown for a specific team
   */
  static hasShownIntro(teamName: string): boolean {
    if (typeof window === 'undefined') return false
    
    const key = this.getStorageKey(teamName)
    return localStorage.getItem(key) === 'true'
  }
  
  /**
   * Mark intro as shown for a specific team
   */
  static markIntroShown(teamName: string): void {
    if (typeof window === 'undefined') return
    
    const key = this.getStorageKey(teamName)
    localStorage.setItem(key, 'true')
    
    // Also store timestamp for analytics
    const timestampKey = `${key}-timestamp`
    localStorage.setItem(timestampKey, new Date().toISOString())
  }
  
  /**
   * Reset intro status for a specific team (for testing)
   */
  static resetIntroStatus(teamName: string): void {
    if (typeof window === 'undefined') return
    
    const key = this.getStorageKey(teamName)
    const timestampKey = `${key}-timestamp`
    
    localStorage.removeItem(key)
    localStorage.removeItem(timestampKey)
  }
  
  /**
   * Reset all team intro statuses (for testing)
   */
  static resetAllIntroStatuses(): void {
    if (typeof window === 'undefined') return
    
    const teams = [
      'Mumbai Indians',
      'Chennai Super Kings', 
      'Royal Challengers Bangalore',
      'Kolkata Knight Riders',
      'Delhi Capitals',
      'Punjab Kings',
      'Rajasthan Royals',
      'Sunrisers Hyderabad',
      'Gujarat Titans',
      'Lucknow Super Giants'
    ]
    
    teams.forEach(team => this.resetIntroStatus(team))
  }
  
  /**
   * Get when intro was first shown for a team
   */
  static getIntroTimestamp(teamName: string): Date | null {
    if (typeof window === 'undefined') return null
    
    const key = this.getStorageKey(teamName)
    const timestampKey = `${key}-timestamp`
    const timestamp = localStorage.getItem(timestampKey)
    
    return timestamp ? new Date(timestamp) : null
  }
  
  /**
   * Get all teams that have shown intro
   */
  static getTeamsWithShownIntro(): string[] {
    if (typeof window === 'undefined') return []
    
    const teams = [
      'Mumbai Indians',
      'Chennai Super Kings', 
      'Royal Challengers Bangalore',
      'Kolkata Knight Riders',
      'Delhi Capitals',
      'Punjab Kings',
      'Rajasthan Royals',
      'Sunrisers Hyderabad',
      'Gujarat Titans',
      'Lucknow Super Giants'
    ]
    
    return teams.filter(team => this.hasShownIntro(team))
  }
  
  /**
   * Generate storage key for team
   */
  private static getStorageKey(teamName: string): string {
    const cleanName = teamName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    
    return `${this.STORAGE_PREFIX}${cleanName}`
  }
  
  /**
   * Get debug info about intro statuses
   */
  static getDebugInfo(): { [teamName: string]: { shown: boolean; timestamp: Date | null } } {
    const teams = [
      'Mumbai Indians',
      'Chennai Super Kings', 
      'Royal Challengers Bangalore',
      'Kolkata Knight Riders',
      'Delhi Capitals',
      'Punjab Kings',
      'Rajasthan Royals',
      'Sunrisers Hyderabad',
      'Gujarat Titans',
      'Lucknow Super Giants'
    ]
    
    const debug: { [teamName: string]: { shown: boolean; timestamp: Date | null } } = {}
    
    teams.forEach(team => {
      debug[team] = {
        shown: this.hasShownIntro(team),
        timestamp: this.getIntroTimestamp(team)
      }
    })
    
    return debug
  }
}

// Export convenience functions
export const hasShownTeamIntro = TeamIntroTracker.hasShownIntro
export const markTeamIntroShown = TeamIntroTracker.markIntroShown
export const resetTeamIntroStatus = TeamIntroTracker.resetIntroStatus
export const resetAllTeamIntros = TeamIntroTracker.resetAllIntroStatuses