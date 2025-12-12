/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for GitHub Pages deployment
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Image optimization for GitHub Pages
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },
  
  // Asset prefix for GitHub Pages (will be set by GitHub Actions)
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES 
    ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'ipl-auction-game'}` 
    : '',
  basePath: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES 
    ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'ipl-auction-game'}` 
    : '',
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
  },
  
  // Headers for global access
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
  
  // Webpack configuration for Socket.IO
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig