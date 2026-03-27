import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'GnosIQ — The Cognitive Capital API',
  description:
    'The first API that turns human potential into computable capital. Pre-launch — coming soon.',
  openGraph: {
    title: 'GnosIQ — The Cognitive Capital API',
    description:
      'The first API that turns human potential into computable capital.',
    url: 'https://gnosiq.ai',
    siteName: 'GnosIQ',
    images: [
      {
        url: '/coming-soon.png',
        width: 1440,
        height: 900,
        alt: 'GnosIQ — The Cognitive Capital API',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GnosIQ — The Cognitive Capital API',
    description:
      'The first API that turns human potential into computable capital.',
    images: ['/coming-soon.png'],
  },
}

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0D0B1E]">
      <Image
        src="/coming-soon.png"
        alt="GnosIQ — The Cognitive Capital API"
        fill
        priority
        quality={95}
        className="object-cover object-center"
      />
    </main>
  )
}
