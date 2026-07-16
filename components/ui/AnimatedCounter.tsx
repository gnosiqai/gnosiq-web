'use client'
import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  duration?: number
  className?: string
  from?: number
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export default function AnimatedCounter({
  value,
  suffix = '',
  duration = 1400,
  className = '',
  from,
}: AnimatedCounterProps) {
  // GNO-93: SSR/hidratação inicial SEMPRE mostram o valor final — crawlers
  // (Googlebot, OG de LinkedIn/WhatsApp/X) e qualquer captura antes do JS
  // rodar veem o número real, nunca um frame intermediário. A contagem
  // (progressive enhancement) só reinicia do zero/from depois que o
  // IntersectionObserver dispara, cliente-side.
  const [display, setDisplay] = useState(value)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // prefers-reduced-motion: manter o valor final, sem animação
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      setDisplay(value)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            setDisplay(from ?? 0)
            setStarted(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!started) return

    const startValue = from ?? 0
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      // Anima de startValue até value
      setDisplay(Math.round(startValue + eased * (value - startValue)))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [started, value, duration, from])

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  )
}
