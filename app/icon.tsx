import { ImageResponse } from 'next/og'
import { loadInter, FONT_FAMILY } from '@/lib/og/fonts'

// GNO-92: favicon gerado — monograma "IQ" do Design System v1.0
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default async function Icon() {
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
          // GNO-102: contraste invertido — em 16px o monograma accent sobre
          // navy sumia; fundo accent com "IQ" branco lê em tema claro e escuro.
          backgroundColor: '#8B5CF6',
          fontFamily: FONT_FAMILY,
          fontSize: 260,
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
