// Utility function to get player image path
export const getPlayerImage = (playerName: string): string => {
  // Try .png first (most common)
  return `/Players/${playerName}.png`
}

// Get player image with .jpg extension
export const getPlayerImageJpg = (playerName: string): string => {
  return `/Players/${playerName}.jpg`
}

// Get player image with .avif extension
export const getPlayerImageAvif = (playerName: string): string => {
  return `/Players/${playerName}.avif`
}

// Generate initials for avatar fallback
export const getPlayerInitials = (playerName: string): string => {
  const names = playerName.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }
  return playerName.substring(0, 2).toUpperCase()
}

// Handle image error with fallback to .jpg, then .avif, then initials
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement>,
  playerName: string
) => {
  const target = e.target as HTMLImageElement
  const currentSrc = target.src
  
  // If we tried .png, try .jpg
  if (currentSrc.endsWith('.png')) {
    target.src = getPlayerImageJpg(playerName)
  } 
  // If we tried .jpg, try .avif
  else if (currentSrc.endsWith('.jpg')) {
    target.src = getPlayerImageAvif(playerName)
  } 
  // If all formats failed, show initials
  else {
    target.style.display = 'none'
    const parent = target.parentElement
    if (parent) {
      const size = parent.classList.contains('w-20') ? 'text-2xl' : 
                   parent.classList.contains('w-16') ? 'text-xl' :
                   parent.classList.contains('w-14') ? 'text-lg' :
                   parent.classList.contains('w-12') ? 'text-sm' : 'text-base'
      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center ${size} font-bold">${getPlayerInitials(playerName)}</div>`
    }
  }
}
