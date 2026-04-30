// GNO-79: og:image estático — serve public/og-image.png (1200×630)
// Substituiu a versão dinâmica next/og do GNO-78 pela imagem oficial da marca
import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const alt = 'GnosIQ — The Cognitive Capital API'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  const imgPath = path.join(process.cwd(), 'public', 'og-image.png')
  const imgData = fs.readFileSync(imgPath)
  const base64 = imgData.toString('base64')
  const dataUrl = `data:image/png;base64,${base64}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={dataUrl}
          alt="GnosIQ — The Cognitive Capital API"
          width={1200}
          height={630}
          style={{ objectFit: 'cover' }}
        />
      </div>
    ),
    { ...size },
  )
}
