import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // output: 'standalone' — NÃO usar, Vercel usa serverless nativo
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
