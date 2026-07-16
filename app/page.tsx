'use client'
import { useEffect } from 'react'
import { armRevealObserver } from '@/lib/reveal'
import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import Problem from '@/components/landing/Problem'
import Solution from '@/components/landing/Solution'
import HowItWorks from '@/components/landing/HowItWorks'
import SocialProof from '@/components/landing/SocialProof'
import WaitlistCTA from '@/components/landing/WaitlistCTA'
import Footer from '@/components/landing/Footer'
import ApiSection from '@/components/landing/ApiSection'

export default function Home() {
  useEffect(() => armRevealObserver(), [])

  return (
    <main className="bg-background-primary min-h-screen">
      <Nav />
      <Hero />
      <ApiSection />
      <Problem />
      <Solution />
      <HowItWorks />
      <SocialProof />
      <WaitlistCTA />
      <Footer />
    </main>
  )
}
