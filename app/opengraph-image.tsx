// GNO-78: og:image serverless via next/og — edge runtime, zero infra
// Next.js 15 auto-registra /opengraph-image sem config adicional
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'GnosIQ — The Cognitive Capital API'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0D0D14',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 96,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-2px',
          }}
        >
          <span>Gnos</span>
          <span style={{ color: '#8B5CF6' }}>IQ</span>
        </div>
        <div style={{ fontSize: 32, color: '#A78BFA', fontWeight: 400 }}>
          The Cognitive Capital API
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 20,
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          gnosiq.ai
        </div>
      </div>
    ),
    { ...size },
  )
}
