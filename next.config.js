/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // GitHub Pages configuration - use repository name based on actual repo name
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ipl-auction-game' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/ipl-auction-game' : '',
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
    NEXT_PUBLIC_BASE_PATH: process.env.NODE_ENV === 'production' ? '/ipl-auction-game' : ''
  }
}

module.exports = nextConfig