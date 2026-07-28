import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // output: 'standalone' — NÃO usar, Vercel usa serverless nativo
  skipTrailingSlashRedirect: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // GNO-92: as rotas de imagem geradas leem as TTFs do disco em runtime —
  // garantir que assets/fonts/ entre no bundle serverless.
  outputFileTracingIncludes: {
    '/opengraph-image': ['./assets/fonts/**'],
    '/twitter-image': ['./assets/fonts/**'],
    '/icon': ['./assets/fonts/**'],
    '/apple-icon': ['./assets/fonts/**'],
  },
  async headers() {
    return [
      {
        // Aplicar a todas as rotas
        source: '/:path*',
        headers: [
          // GNO-80: Fix B — headers de segurança para in-app browsers
          // NÃO adicionar Content-Security-Policy restritivo — pode quebrar scripts
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/ph/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ph/array/:path*',
        destination: 'https://us-assets.i.posthog.com/array/:path*',
      },
      {
        source: '/ph/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
}

export default nextConfig
