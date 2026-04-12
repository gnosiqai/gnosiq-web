'use client'
import { useEffect } from 'react'
import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import Problem from '@/components/landing/Problem'
import Solution from '@/components/landing/Solution'
import HowItWorks from '@/components/landing/HowItWorks'
import SocialProof from '@/components/landing/SocialProof'
import WaitlistCTA from '@/components/landing/WaitlistCTA'
import Footer from '@/components/landing/Footer'

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 },
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

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
