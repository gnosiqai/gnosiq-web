import { ImageResponse } from 'next/og'
import { loadInter } from '@/lib/og/fonts'

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
          backgroundColor: '#0D0B1E',
          fontFamily: 'Inter',
          fontSize: 260,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: '#8B5CF6',
        }}
      >
        IQ
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Inter', data: extraBold, weight: 800, style: 'normal' }],
    }
  )
}
