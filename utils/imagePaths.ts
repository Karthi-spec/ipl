// Utility function to handle image paths for both local and GitHub Pages deployment
export const getImagePath = (path: string): string => {
  // For local development, just return the path as-is
  if (process.env.NODE_ENV === 'development') {
    return path;
  }
  
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // If path already starts with basePath, don't add it again
  if (basePath && path.startsWith(basePath)) {
    return path;
  }
  
  // Add basePath for production deployment
  return `${basePath}${path}`;
};

// Team logo paths - centralized configuration
export const teamLogos: { [key: string]: string } = {
  'Mumbai Indians': '/logos/Original Mumbai Indians PNG-SVG File Download Free Download.png',
  'Chennai Super Kings': '/logos/Original Chennai Super Fun Logo PNG - SVG File Download Free Download.png',
  'Royal Challengers Bangalore': '/logos/rcb-logo-png_seeklogo-531612.png',
  'Kolkata Knight Riders': '/logos/Original Kolkata Knight Riders PNG-SVG File Download Free Download.png',
  'Delhi Capitals': '/logos/delhi-capitals.png',
  'Punjab Kings': '/logos/Original Punjab Kings PNG-SVG File Download Free Download.png',
  'Rajasthan Royals': '/logos/Original Rajasthan Royals Logo PNG-SVG File Download Free Download.png',
  'Sunrisers Hyderabad': '/logos/Original Sunrisers Hyderabad PNG-SVG File Download Free Download.png',
  'Gujarat Titans': '/logos/Original Gujarat Titans Logo PNG-SVG File Download Free Download.png',
  'Lucknow Super Giants': '/logos/Original Lucknow Super Giants PNG-SVG File Download Free Download.png'
};

// Get team logo with proper path handling
export const getTeamLogo = (teamName?: string): string | null => {
  if (!teamName || !teamLogos[teamName]) {
    return null;
  }
  
  return getImagePath(teamLogos[teamName]);
};