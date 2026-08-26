// conteúdo com classe .reveal já é visível via CSS por padrão (SSR/no-JS
// safe — ver .reveal em globals.css). O estado oculto pré-animação (.reveal-armed)
// só é aplicado quando este observer de fato inicializa, client-side.
export function armRevealObserver(): () => void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return () => {}

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
}
