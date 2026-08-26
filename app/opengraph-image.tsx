import { ImageResponse } from 'next/og'
import { loadInter, FONT_FAMILY } from '@/lib/og/fonts'

// OG image gerada — Design System v1.0
// Substitui public/og-image.png (estático, wordmark defasado)
export const alt = 'GnosIQ - The Cognitive Capital API'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Textura dot-grid — tile SVG de 32px com um ponto accent a ~16% de opacidade.
// Satori não tila `radial-gradient` + `background-size`; um data URI com
// `background-repeat: repeat` é o caminho suportado.
const DOT_TILE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">' +
  '<circle cx="16" cy="16" r="1.6" fill="#8B5CF6" fill-opacity="0.16"/>' +
  '</svg>'

const DOT_GRID = `url(data:image/svg+xml;base64,${Buffer.from(
  DOT_TILE_SVG
).toString('base64')})`

export default async function Image() {
  const { extraBold, regular } = await loadInter()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0D0B1E',
          backgroundImage: DOT_GRID,
          backgroundRepeat: 'repeat',
          fontFamily: FONT_FAMILY,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 150,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: '#FFFFFF',
          }}
        >
          <span>Gnos</span>
          <span style={{ color: '#8B5CF6' }}>IQ</span>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 40,
            fontSize: 28,
            fontWeight: 400,
            letterSpacing: '0.28em',
            color: '#9CA3AF',
          }}
        >
          THE COGNITIVE CAPITAL API
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 72,
            fontSize: 26,
            fontWeight: 400,
            color: '#A78BFA',
          }}
        >
          gnosiq.ai
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: FONT_FAMILY, data: extraBold, weight: 800, style: 'normal' },
        { name: FONT_FAMILY, data: regular, weight: 400, style: 'normal' },
      ],
    }
  )
}
