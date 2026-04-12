import type { Metadata } from 'next'
import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import Problem from '@/components/landing/Problem'
import Solution from '@/components/landing/Solution'
import HowItWorks from '@/components/landing/HowItWorks'
import SocialProof from '@/components/landing/SocialProof'
import WaitlistCTA from '@/components/landing/WaitlistCTA'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'GnosIQ — The Cognitive Capital API',
  description:
    'A primeira API que transforma potencial humano em capital computável. Assessment cognitivo profundo em 30 minutos por R$97.',
  openGraph: {
    title: 'GnosIQ — The Cognitive Capital API',
    description:
      'A primeira API que transforma potencial humano em capital computável.',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://gnosiq.ai',
    siteName: 'GnosIQ',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GnosIQ — The Cognitive Capital API',
    description:
      'A primeira API que transforma potencial humano em capital computável.',
    creator: '@gnosiqai',
  },
}

export default function Home() {
  return (
    <main className="bg-background-primary min-h-screen">
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <SocialProof />
      <WaitlistCTA />
      <Footer />
    </main>
  )
}
