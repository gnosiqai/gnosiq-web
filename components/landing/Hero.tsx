'use client'

import posthog from 'posthog-js'
import HeroBackground from './HeroBackground'
import FounderSlots from './FounderSlots'
import { FILL_MINUTES, DELIVERY_MINUTES, REPORT_PAGES } from '@/lib/constants/metrics'

// GNO-115 — Hero v2 (AEO waitlist-first).
//
// Formato "Million-Dollar": H1 é a pergunta do comprador, e a primeira coisa
// abaixo dela é a RESPOSTA em 40–60 palavras, acima da dobra. É o bloco que
// um motor de resposta cita — precisa se sustentar fora da página.
//
// CFP: a palavra "diagnóstico" não aparece nesta superfície. A v1 dizia
// "o diagnóstico cognitivo profundo era caro" — trocado por "mapeamento".
// VETO GATE: nenhum preço numérico. A v1 trazia "A partir de R$97" aqui.
// CTA ÚNICO: a v1 tinha dois botões; a v2 tem um, e ele vai para a waitlist.

export default function Hero() {
  const handleCtaClick = () => {
    posthog.capture('cta clicked', {
      label: 'hero_primary',
      destination: '#waitlist',
    })
  }

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* LAYER 1: Neural canvas */}
      <HeroBackground />

      {/* LAYER 2: Radial purple glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.18) 0%, transparent 70%)',
          zIndex: 1,
        }}
      />

      {/* LAYER 3: Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          zIndex: 2,
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-32 text-center max-w-4xl">
        {/* Eyebrow — marcas INPI como sinal de seriedade */}
        <p className="font-mono text-xs md:text-sm text-accent-light uppercase tracking-[0.14em] mb-6">
          GnosIQ™ · GnoScore™ · Beta
        </p>

        {/* H1 — a pergunta do comprador */}
        <h1 className="text-4xl md:text-6xl font-bold text-text-primary leading-[1.08] tracking-tight mb-7 max-w-3xl mx-auto">
          Como a sua mente <span className="text-accent">realmente</span> funciona?
        </h1>

        {/*
          ANSWER BLOCK — 40–60 palavras, texto real, acima da dobra.
          Autocontido de propósito: é o trecho que um motor de resposta cita
          sem o resto da página junto.
        */}
        <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
          A GnosIQ mapeia o seu perfil cognitivo com uma combinação única de
          instrumentos validados e IA especializada, e entrega um relatório de{' '}
          {REPORT_PAGES} páginas com o seu GnoScore™ em cerca de {DELIVERY_MINUTES}{' '}
          minutos, direto do navegador, sem semanas de espera. A avaliação é
          adaptativa e leva cerca de {FILL_MINUTES} minutos, do seu computador ou
          celular.
        </p>

        {/* ICP — item 4 do delta */}
        <p className="text-base text-accent-light max-w-xl mx-auto mt-5">
          Para quem toma decisões de alta consequência, e para quem sempre quis se
          entender de verdade.
        </p>

        {/* CTA ÚNICO */}
        <div className="mt-10 flex justify-center">
          <a
            href="#waitlist"
            onClick={handleCtaClick}
            className="btn-cta-primary cta-pulse bg-accent hover:bg-accent-dark text-white font-bold px-11 py-[18px] rounded-xl text-lg transition-colors"
          >
            Entrar na lista de espera
          </a>
        </div>

        {/* Escassez real — nunca número inventado (item 8 do delta) */}
        <FounderSlots className="text-sm text-text-muted mt-8" />

        {/* Disclaimer clínico visível no hero */}
        <p className="text-sm text-text-muted mt-9">
          A GnosIQ não substitui avaliação clínica.
        </p>
      </div>
    </section>
  )
}
