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
import ApiSection from '@/components/landing/ApiSection'

export default function Home() {
  useEffect(() => {
    // GNO-93: conteúdo já é visível via CSS por padrão (SSR/no-JS safe).
    // Só aplicamos o estado oculto pré-animação quando o observer de fato inicializa.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const items = document.querySelectorAll('.reveal')
    items.forEach((el) => el.classList.add('reveal-armed'))

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove('reveal-armed')
            e.target.classList.add('visible')
          }
        }),
      { threshold: 0.1 },
    )
    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

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
