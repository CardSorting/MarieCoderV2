import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable experimental features for Next.js 16
  experimental: {
    // Experimental features can be added here if needed
  },

  // API rewrites for backend proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ]
  },

  // Transpile specific packages if needed
  transpilePackages: ['xterm', 'xterm-addon-fit'],

  // Configure images if needed
  images: {
    unoptimized: true,
  },

  // Output configuration for Docker
  output: 'standalone',
}

export default nextConfig

