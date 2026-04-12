'use client'
import { useEffect, useRef } from 'react'

/**
 * useStaggerReveal
 * Observa um container e aplica animação stagger nos filhos com classe .stagger-item.
 * Cada filho recebe `animation-delay` incremental de `staggerMs`.
 */
export function useStaggerReveal(staggerMs = 100) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const container = containerRef.current
    if (!container) return

    const items = Array.from(
      container.querySelectorAll<HTMLElement>('.stagger-item'),
    )

    if (prefersReduced) {
      // Estado final imediato — sem animação
      items.forEach((el) => {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      })
      return
    }

    // Preparar estado inicial
    items.forEach((el, i) => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(16px)'
      el.style.transition = `opacity 600ms cubic-bezier(0.16,1,0.3,1) ${i * staggerMs}ms, transform 600ms cubic-bezier(0.16,1,0.3,1) ${i * staggerMs}ms`
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            items.forEach((el) => {
              el.style.opacity = '1'
              el.style.transform = 'translateY(0)'
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [staggerMs])

  return containerRef
}
