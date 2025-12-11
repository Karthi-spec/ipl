/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // GitHub Pages configuration - use repository name 'ipl'
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ipl' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/ipl' : '',
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
  }
}

module.exports = nextConfig