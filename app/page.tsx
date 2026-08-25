import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import MetricsStrip from '@/components/landing/MetricsStrip'
import WhatYouGet from '@/components/landing/WhatYouGet'
import Problem from '@/components/landing/Problem'
import Science from '@/components/landing/Science'
import FounderConditions from '@/components/landing/FounderConditions'
import WaitlistSection from '@/components/landing/WaitlistSection'
import Faq from '@/components/landing/Faq'
import Footer from '@/components/landing/Footer'
import StructuredData from '@/components/landing/StructuredData'
import RevealObserver from '@/components/landing/RevealObserver'

// GNO-115 — LP v2, formato AEO waitlist-first.
//
// A ordem é a do wireframe: pergunta (hero) → prova de produto → problema →
// prova científica → oferta → conversão → FAQ. Cada H2 é uma pergunta que a
// seção responde; a prova de produto sobe para logo depois do hero porque o
// trecho real do relatório converte mais que features genéricas.
//
// Server component: o JSON-LD e o carimbo "Atualizado em" do rodapé são
// resolvidos no build. A interatividade mora nas seções client.

export default function Home() {
  return (
    <>
      <StructuredData />
      <RevealObserver />
      <main className="bg-background-primary min-h-screen">
        <Nav />
        <Hero />
        <MetricsStrip />
        <WhatYouGet />
        <Problem />
        <Science />
        <FounderConditions />
        <WaitlistSection />
        <Faq />
        <Footer />
      </main>
    </>
  )
}
