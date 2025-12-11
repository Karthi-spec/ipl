// Player Video Utility
// Handles player video paths and availability

export function getPlayerVideoPath(playerName: string): string {
  // Clean player name for file matching
  const cleanName = playerName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  
  // Return video path - videos should be in public/player-videos/
  return `/player-videos/${cleanName}.mp4`
}

export function getPlayerVideoUrl(playerName: string): string {
  // For local development, videos should be copied to public/player-videos/
  // For production, this could point to a CDN or external storage
  return getPlayerVideoPath(playerName)
}

export async function checkVideoExists(videoUrl: string): Promise<boolean> {
  try {
    const response = await fetch(videoUrl, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Common player names that might have videos
export const PLAYERS_WITH_VIDEOS = [
  'Virat Kohli',
  'MS Dhoni', 
  'Rohit Sharma',
  'KL Rahul',
  'Rishabh Pant',
  'Hardik Pandya',
  'Jasprit Bumrah',
  'Yuzvendra Chahal',
  'Shubman Gill',
  'Yashasvi Jaiswal',
  'Ruturaj Gaikwad',
  'Shreyas Iyer',
  'Jos Buttler',
  'David Miller',
  'Kagiso Rabada',
  'Mitchell Starc',
  'Pat Cummins',
  'Rashid Khan',
  'Sunil Narine',
  'Andre Russell'
]

export function hasPlayerVideo(playerName: string): boolean {
  return PLAYERS_WITH_VIDEOS.includes(playerName)
}