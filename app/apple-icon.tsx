import { ImageResponse } from 'next/og'
import { loadInter, FONT_FAMILY } from '@/lib/og/fonts'

// GNO-92: apple touch icon gerado — monograma "IQ" do Design System v1.0
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default async function AppleIcon() {
  const { extraBold } = await loadInter()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // GNO-102: contraste invertido — ver app/icon.tsx
          backgroundColor: '#8B5CF6',
          borderRadius: 36,
          fontFamily: FONT_FAMILY,
          fontSize: 92,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: '#FFFFFF',
        }}
      >
        IQ
      </div>
    ),
    {
      ...size,
      fonts: [{ name: FONT_FAMILY, data: extraBold, weight: 800, style: 'normal' }],
    }
  )
}
