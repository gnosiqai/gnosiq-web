'use client'
import { useEffect, useRef } from 'react'

interface NodeItem {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  pulsePhase: number
}

const NODE_COUNT   = 14
const MAX_DISTANCE = 180
const ACCENT       = '139,92,246'   // #8B5CF6 em RGB

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    const nodes: NodeItem[] = []

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Inicializar nós
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x:          Math.random() * canvas.width,
        y:          Math.random() * canvas.height,
        vx:         (Math.random() - 0.5) * 0.3,
        vy:         (Math.random() - 0.5) * 0.3,
        radius:     Math.random() * 2 + 1.5,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    const animate = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Mover nós
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
      }

      // Desenhar conexões dinâmicas (baseado em distância)
      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const dx   = nodes[i].x - nodes[j].x
          const dy   = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DISTANCE) {
            const alpha = (1 - dist / MAX_DISTANCE) * 0.12
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(${ACCENT},${alpha})`
            ctx.lineWidth   = 0.8
            ctx.stroke()
          }
        }
      }

      // Desenhar nós
      for (const n of nodes) {
        const pulse = Math.sin(t * 0.001 + n.pulsePhase) * 0.4 + 0.6
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius * pulse, 0, Math.PI * 2)
        ctx.fillStyle   = `rgba(${ACCENT},${0.35 * pulse})`
        ctx.fill()

        // Halo suave
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius * pulse * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${ACCENT},${0.06 * pulse})`
        ctx.fill()
      }

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
